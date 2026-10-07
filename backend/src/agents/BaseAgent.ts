import { ActivityLogger } from '../services/ActivityLogger';
import { EmployeeService, Employee } from '../services/EmployeeService';

export abstract class BaseAgent {
  protected profile!: Employee;
  protected activityLogger: ActivityLogger;
  protected currentSessionId?: string;

  constructor(employeeId: string, sessionId?: string) {
    this.currentSessionId = sessionId;
    const hr = new EmployeeService();
    const emp = hr.getById(employeeId);
    if (!emp) throw new Error(`Employee with id ${employeeId} not found`);
    this.profile = emp;
    this.activityLogger = new ActivityLogger();
  }

  getProfile() {
    return this.profile;
  }

  protected log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', data?: any) {
    console.log(`[Agent: ${this.profile.name}] ${message}`);
    
    // Log persistently to activity_log.json
    if (type === 'success' || type === 'error') {
      this.activityLogger.log({
        agentId: this.profile.id,
        sessionId: this.currentSessionId,
        action: message,
        details: data ? JSON.stringify(data) : '',
        status: type === 'error' ? 'error' : 'success'
      });
    }
  }

  public gainExperience() {
    this.profile.level += 1;
    this.log(`Leveled up to Lvl ${this.profile.level}!`, 'success');
    const hr = new EmployeeService();
    hr.update(this.profile.id, { level: this.profile.level });
  }
}
