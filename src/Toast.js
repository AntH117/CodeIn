
import { Toaster, toast } from 'react-hot-toast';

const notify = {
    success: (msg, icon) => toast.success(msg, { icon: icon || "✅", duration: 4000, position: 'bottom-right'}),
    error: (msg, icon) => toast.error(msg, { icon: icon || "❌", duration: 4000, position: 'bottom-right' }),
    warn: (msg, icon) => toast(msg, { icon: icon || "⚠️", duration: 4000, position: 'bottom-right' }),
  };

export default notify