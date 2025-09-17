enum IncidentType {
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  NETWORK = 'network',
  SECURITY = 'security',
  OTHER = 'other'
}

enum IncidentSeverity{
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum IncidentResolutionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

enum AdminRole {
  SUPERADMIN = 'superadmin',
  DEPARTMENT_ADMIN = 'incident_manager',
}

export {IncidentType,IncidentSeverity,IncidentResolutionStatus,AdminStatus,AdminRole }