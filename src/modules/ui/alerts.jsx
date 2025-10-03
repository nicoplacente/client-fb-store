import { toast } from "sonner";

export function alerts(type, txt) {
  toast[type](txt);
}
