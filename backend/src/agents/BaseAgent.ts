import Anthropic from '@anthropic-ai/sdk';
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

  
  protected async callLLM(prompt: string): Promise<string> {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
    const sys = this.profile.systemPrompt || 'Du bist ein KI-Agent.';
    
    const response = await anthropic.messages.create({
      model: this.profile.aiModel || 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      system: sys,
      messages: [{ role: 'user', content: prompt }]
    });

    let textContent = '';
    if (Array.isArray(response.content)) {
      const block = response.content.find((c: any) => c.type === 'text');
      textContent = block ? (block as any).text : '';
    } else {
      textContent = response.content as unknown as string;
    }
    
    return textContent.replace(/\x60\x60\x60json/g, '').replace(/\x60\x60\x60/g, '').trim();
  }

  public gainExperience() {
    this.profile.level += 1;
    // this.log(`Leveled up to Lvl ${this.profile.level}!`, 'success');
    const hr = new EmployeeService();
    hr.update(this.profile.id, { level: this.profile.level });
  }
}
