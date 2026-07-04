export interface GuessRecord {
  deviceId: string;
  dayIndex: number;
  date: string;
  questionId: number;
  low: number;
  high: number;
  confidence: number;
  score: number;
  hit: boolean;
  submittedAt: string;
}

export interface GuessStore {
  findByDeviceAndDay(
    deviceId: string,
    dayIndex: number,
  ): Promise<GuessRecord | null>;
  findByDevice(deviceId: string): Promise<GuessRecord[]>;
  insert(record: GuessRecord): Promise<void>;
  trackEvent(
    eventType: string,
    deviceId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
}
