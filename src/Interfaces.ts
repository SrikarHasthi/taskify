import { Styles } from 'react-modal';

export interface CustomModalStyles extends Styles {
  content: React.CSSProperties;
  overlay: React.CSSProperties;
}

export interface priorityInterface {
  value: string,
  imgSrc: string,
}

export interface TaskData {
  id?: number,
  summary: string,
  description: string,
  priority: string,
  time: number,
  dateCreated: string,
  status: string,
}

// export interface PayloadTaskData {
//   dateCreated: string,
//   summary: string,
//   description: string,
//   priority: string,
//   time: number,
//   status: string,
// }

export interface TimeConverter {
  toDisplayTime(): string,
  toAlphaNumericTime(): string,
  toMs(): number,
}

export interface allTasksHistory {
  todoHistoryId: number,
  dateCreated: string,
  todos: TaskData[],
}