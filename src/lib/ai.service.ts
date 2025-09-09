
interface GroqResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export interface AISuggestion {
    diagnosis: string;
    measure: string[];
    incident_type: string;
    resolution_strategy_type: string;
    recommendation: string;
}

export interface IncidentInfo {
    description: string;
    department: string;
    severity: string;
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
    incidentDetails: IncidentInfo
): AISuggestion {
    const { description } = incidentDetails;
    return {
        "diagnosis": description.length > 100 
            ? `AI analysis is not possible in the meantime. Incident: ${description.substring(0, 100)}...` 
            : description,
        "measure": [
            "1. Identify the components involved in the incident",
            "2. Check network connections and power supply",
            "3. Restart the relevant services/equipment",
            "4. Test the functionality after intervention",
            "5. Document the solution and escalate if necessary"
        ],
        "resolution_strategy_type":  "immediate_fix",
        "incident_type":  "other", 
        "recommendation": "Perform regular maintenance and updates to prevent similar incidents in the future."
    };
}

export async function getAISuggestion(incidentInfo : IncidentInfo): Promise<AISuggestion> {
    const { description, department, severity } = incidentInfo;
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY environment variable is required");
    }
    
    const client = new GroqClient(GROQ_API_KEY);
    
    const systemPrompt = `You are an IT expert at the Ministry of Finance (MINFI) of Cameroon.
        Your role is to provide precise diagnostics and clear, practical resolution steps to help IT incident managers
        effectively resolve reported problems, drawing on the specific context of MINFI.
        Analyze the following incident and provide a structured response in a strict JSON format

## Available Context: Known Applications (with dependencies) :

📌 **Direction du Budget (DGB)**
    Living.dgb.cm: Deblocking decisions (LAN, PROBMIS)
    PGI (Integrated Management Software): Accounting & expenditure execution (Internet, LAN, ANTILOPE, PROBMIS)
    PROBMIS (Budget Commitment Monitoring System): Budget commitment monitoring (LAN, WAN)
    ANTILOPE (Human Resources and Payroll System): Staff & payroll management (LAN, WAN)
    AVI (Irrevocable Transfer Voucher): Irrevocable transfer attestation (LAN)
    DECOSYS (Floating Debt Monitoring System): Floating debt monitoring (LAN)
    GovRH (Government Human Resources): DGB staff monitoring (LAN)
    ArchiDccs (Document Archiving System): Document archiving (LAN)

📌 **CAB-IG-SG**
    E-bulletin: Online pay slips (Internet, Interco, ANTILOPE)
    mail.minfi.cm: Professional email (Internet, LAN, PROBMIS)
    E-bon: Commitment order monitoring (Internet, LAN, PROBMIS, CADRE, SYSTAC)
    SYGESCA: Administrative mail management (LAN)
    FDX: Inter-agency financial data exchange (Internet, LAN, PROBMIS, CAMCIS, HARMONY…)

📌 **DNCM / DP / DRH / DRFI**
    SIGIPES: Personnel & payroll management (LAN, Interconnection)
    SIPAE: Macroeconomic projections (LAN, Interconnection)
    TABORD soft: State finance dashboard (LAN, Interconnection)
    BDP6+: IMF balance of payments (LAN, Interconnection)
    SRH: Human Resources management (LAN, ANTILOPE)
    RMS: Record management (LAN)
    COLEPS: E-procurement (LAN, Internet)
    BSP Soft: Provisional payroll terminal (LAN)
    DP Manager: Form management (LAN)
    GEPSOFT: Material accounting (LAN)

📌 **Acronyms Explained**
    LAN: Local Area Network
    WAN: Wide Area Network
    Interco: Ministerial WAN of the Ministry of Finance.
    CADRE: Specific internal application for commitment frameworks
    SYSTAC: Specific internal application or system.
    CAMCIS: MIS for customs and transit.
    HARMONY: Likely another external or partner financial management system.
    IMF: International Monetary Fund

INCIDENT RELEVANT DETAILS:
- Description: ${description}
- Department affected or where declared: ${department}  
- Severity: ${severity}

OBLIGATORY RESPONSE FORMAT (JSON only):
{
  "diagnosis": "Most likely cause of the incident",
  "measure": [
    "1. Specific action to take",
    "2. Verification or test to perform",
    "3. Configuration to modify",
    "4. Escalation if necessary",
    "5. Final validation"
  ],
  "incident_type": "software|hardware|network|security|other",
  "resolution_strategy_type": "immediate_fix|workaround|long_term_solution",
  "temps_resolution_estime": "30min|2h|1j|3j|1sem",
  "recommendation": "preventive measures to addopt in order to avoid recurrence of the incident"
}

Now analyse the submittted incident and return a Json Response.`;

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
                diagnosis: suggestion.diagnosis || "Non spécifié",
                measure: Array.isArray(suggestion.measure) 
                    ? suggestion.measure 
                    : ["Manually analyse the Incident"],
                incident_type: suggestion.incident_type || "Not specified",
                resolution_strategy_type: suggestion.resolution_strategy_type || "Not specified",
                recommendation: suggestion.recommendation || "Not specified",
            };
            
            return validatedSuggestion;
            
        } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            return createFallbackSuggestion(incidentInfo);
        }
            
    } catch (error) {
        console.error("API error:", error);
        return createFallbackSuggestion(incidentInfo);
    }
}
