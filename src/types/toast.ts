import { RoomCategoryCode } from './hotel';
import { ActiveTab } from '../components/Header';

export type ToastType =
  | 'strategy_recommendation'
  | 'data_sync'
  | 'alert_detected'
  | 'system_info';

export interface ToastAction {
  label: string;
  tab: ActiveTab;
  date?: string;
  category?: RoomCategoryCode;
  alertId?: string;
}

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: string;
  source: string;
  category?: RoomCategoryCode;
  date?: string;
  action?: ToastAction;
  duration?: number; // in milliseconds
  read?: boolean;
}
