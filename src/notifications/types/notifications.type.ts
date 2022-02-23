export interface NotificationData {
  topic: string,
  data: {[key: string]: string},
  tag?: string,
  collapseKey?: string
}