import { Database } from "../lib/database.types";
import { supabase } from "../lib/supabase";

type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];
const NOTIFICATION_COLUMNS =
  "id,recipient_id,type,title,message,link,read_at,created_at" as const;

export interface AppNotification {
  id: string;
  type: NotificationRow["type"];
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

const mapNotification = (row: NotificationRow): AppNotification => ({
  id: row.id,
  type: row.type,
  title: row.title,
  message: row.message,
  link: row.link,
  readAt: row.read_at,
  createdAt: row.created_at,
});

export class NotificationService {
  static async getLatest(limit = 20): Promise<AppNotification[]> {
    const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
    const { data, error } = await supabase
      .from("notifications")
      .select(NOTIFICATION_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (error) throw new Error(error.message);
    return (data || []).map(mapNotification);
  }

  static async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  static async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);

    if (error) throw new Error(error.message);
  }
}

export default NotificationService;
