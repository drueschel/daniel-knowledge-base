export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  level: number;
  traits: string[];
}

export abstract class BaseAgent {
  protected profile: AgentProfile;
  protected memory: any[] = []; // Placeholder for agent memory / context

  constructor(profile: AgentProfile) {
    this.profile = profile;
  }

  getProfile() {
    return this.profile;
  }

  // Common method to log agent actions
  protected log(message: string) {
    console.log(`[Agent: ${this.profile.name}] ${message}`);
  }

  // Evolve agent (increase level, adjust stats) based on successful tasks
  public gainExperience() {
    this.profile.level += 1;
    this.log(`Leveled up to Lvl ${this.profile.level}!`);
  }
}
