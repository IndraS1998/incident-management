
interface GroqResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

interface AISuggestion {
    diagnostic: string;
    etapes_resolution: string[];
    classification: string;
    priorite: string;
    service_impacte: string;
    temps_resolution_estime: string;
    prevention: string;
}

interface IncidentInfo {
    description: string;
    service: string;
    type_incident: string;
    niveau_urgence: string;
}

class GroqClient {
    private apiKey: string;
    
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    
    async chatCompletionsCreate(params: {
        model: string;
        messages: Array<{role: string; content: string}>;
        temperature: number;
        max_tokens: number;
    }): Promise<GroqResponse> {
        // Implementation for calling Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    }
}

function createFallbackSuggestion(
    description: string, 
    service: string, 
    type_incident: string, 
    niveau_urgence: string, 
): AISuggestion {
    return {
        "diagnostic": description.length > 100 
            ? `Analyse automatique indisponible. Incident: ${description.substring(0, 100)}...` 
            : description,
        "etapes_resolution": [
            "1. Identifier les composants impliqués dans l'incident",
            "2. Vérifier les connexions réseau et alimentation", 
            "3. Redémarrer les services/équipements concernés",
            "4. Tester la fonctionnalité après intervention",
            "5. Documenter la solution et escalader si nécessaire"
        ],
        "classification": type_incident || "Analyse manuelle requise",
        "priorite": niveau_urgence || "Modérée", 
        "service_impacte": service || "Non identifié",
        "temps_resolution_estime": "2h",
        "prevention": "Effectuer maintenance préventive et surveillance proactive"
    };
}

export async function getAISuggestion(incidentInfo : IncidentInfo): Promise<AISuggestion> {
    const { description, service, type_incident, niveau_urgence } = incidentInfo;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY environment variable is required");
    }
    
    const client = new GroqClient(GROQ_API_KEY);
    
    const systemPrompt = `Tu es un expert IT du Ministère des Finances (MINFI) du Cameroun. Ton rôle est de fournir des diagnostics précis et des étapes de résolution claires et pratiques pour aider les gestionnaires d'incidents informatiques à résoudre efficacement les problèmes signalés, en s'appuyant sur le contexte spécifique du MINFI.
Analyse l'incident suivant et fournis une réponse structurée au format JSON strict.

## Contexte disponible Applications connues (avec dépendances) :

📌 **Direction du Budget (DGB)**
- Living.dgb.cm : décisions de déblocage (LAN, PROBMIS)
- PGI : comptabilité & exécution des dépenses (Internet, LAN, ANTILOPE, PROBMIS)
- PROBMIS : suivi des engagements budgétaires (LAN, WAN)
- ANTILOPE : gestion personnel & solde (LAN, WAN)
- AVI : attestation de virement irrévocable (LAN)
- DECOSYS : suivi dette flottante (LAN)
- GovRH : suivi personnel DGB (LAN)
- ArchiDccs : archivage documents (LAN)

📌 **CAB-IG-SG**
- E-bulletin : bulletins de solde en ligne (Internet, Interco, ANTILOPE)
- mail.minfi.cm : messagerie professionnelle (Internet, LAN, PROBMIS)
- E-bon : suivi des bons d’engagements (Internet, LAN, PROBMIS, CADRE, SYSTAC)
- SYGESCA : gestion courrier administratif (LAN)
- FDX : échanges de données financières inter-administrations (Internet, LAN, PROBMIS, CAMCIS, HARMONY…)

📌 **DNCM / DP / DRH / DRFI**
- SIGIPES : gestion personnels & solde (LAN, Interconnexion)
- SIPAE : projections macroéconomiques (LAN, Interconnexion)
- TABORD soft : tableau de bord finances de l’État (LAN, Interconnexion)
- BDP6+ : balance des paiements FMI (LAN, Interconnexion)
- SRH : gestion RH (LAN, ANTILOPE)
- RMS : record management (LAN)
- COLEPS : e-procurement (LAN, Internet)
- BSP Soft : borne de solde provisoire (LAN)
- DP Manager : gestion fiches (LAN)
- GEPSOFT : comptabilité matière (LAN)

INFORMATIONS DE L'INCIDENT:
- Description: ${description}
- Service: ${service}  
- Type: ${type_incident}
- Urgence: ${niveau_urgence}

FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement):
{
  "diagnostic": "Diagnostic précis de la cause probable",
  "etapes_resolution": [
    "1. Action spécifique à effectuer",
    "2. Vérification ou test à faire",
    "3. Configuration à modifier",
    "4. Escalade si nécessaire",
    "5. Validation finale"
  ],
  "classification": "Matériel|Logiciel bureautique|Logiciel métier|Infrastructure Réseau|Sécurité|Autres",
  "priorite": "Critique|Élevée|Modérée|Faible",
  "service_impacte": "${service}",
  "temps_resolution_estime": "30min|2h|1j|3j|1sem",
  "prevention": "Mesure préventive recommandée"
}

Analyse maintenant l'incident fourni et retourne UNIQUEMENT le JSON de réponse.`;

    try {
        const response = await client.chatCompletionsCreate({
            model: "llama-3.1-8b-instant",
            messages: [
                {"role": "system", "content": systemPrompt},
                {"role": "user", "content": `Analyse cet incident: ${description}`}
            ],
            temperature: 0.1,
            max_tokens: 1000
        });

        let rawContent = response.choices[0].message.content.trim();
        
        // Extract JSON from code blocks if present
        if (rawContent.includes("```json")) {
            rawContent = rawContent.split("```json")[1].split("```")[0].trim();
        } else if (rawContent.includes("```")) {
            rawContent = rawContent.split("```")[1].split("```")[0].trim();
        }
        
        try {
            const suggestion = JSON.parse(rawContent) as Partial<AISuggestion>;
            /*const requiredFields: (keyof AISuggestion)[] = [
                "diagnostic", "etapes_resolution", "classification", 
                "priorite", "service_impacte", "prevention"
            ];*/
            
            // Create a validated suggestion with default values for missing fields
            const validatedSuggestion: AISuggestion = {
                diagnostic: suggestion.diagnostic || "Non spécifié",
                etapes_resolution: Array.isArray(suggestion.etapes_resolution) 
                    ? suggestion.etapes_resolution 
                    : ["Analyser l'incident manuellement"],
                classification: suggestion.classification || "Non spécifié",
                priorite: suggestion.priorite || "Modérée",
                service_impacte: suggestion.service_impacte || service || "Non identifié",
                prevention: suggestion.prevention || "Non spécifié",
                temps_resolution_estime: suggestion.temps_resolution_estime || "2h"
            };
            
            return validatedSuggestion;
            
        } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            return createFallbackSuggestion(description, service, type_incident, niveau_urgence);
        }
            
    } catch (error) {
        console.error("API error:", error);
        return createFallbackSuggestion(description, service, type_incident, niveau_urgence);
    }
}
