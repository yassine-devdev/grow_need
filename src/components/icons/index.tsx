import { sharedIcons } from './shared';
import { schoolIcons } from './school';
import { administrationIcons } from './administration';
import { teacherIcons } from './teacher';
import { studentIcons } from './student';
import { parentIcons } from './parent';
import { marketingIcons } from './marketing';
import { financeIcons } from './finance';
import { gamificationIcons } from './gamification';
import * as L from './lucide';

const marketplaceIcons = {
  Apparel: L.Shirt,
  Books: L.BookCopy,
  Tech: L.Laptop,
  GiftShop: L.Gift,
  Ticket: L.Ticket,
  Package: L.Package,
  MyOrders: L.ClipboardList,
  MyListings: L.Tag,
  PaymentSettings: L.CreditCard,
  Events: L.CalendarDays,
  Services: L.Heart,
  Deals: L.Tag,
};

const hobbiesIcons = {
  // L1
  Creative: L.Paintbrush,
  Sports: L.Bike,
  Gaming: L.Gamepad2,
  Collecting: L.Archive,
  Outdoors: L.Mountain,

  // L2
  ArtGallery: L.Image,
  MusicStudio: L.Music,
  WritingDesk: L.PenSquare,
  ActivityLog: L.Activity,
  GoalTracker: L.Goal,
  TeamHub: L.Users,
  GameLibrary: L.Gamepad2,
  SessionLogger: L.Clock,
  BoardGameNights: L.Swords,
  CollectionManager: L.Archive,
  Wishlist: L.Heart,
  TrailFinder: L.Mountain,
  GardenPlanner: L.Leaf,
};

const videoIcons = {
    Elements: L.Shapes,
    Audio: L.AudioLines,
    Text: L.Text,
    Transcript: L.FileText,
    Effects: L.Sparkles,
    Transitions: L.Layers3,
    Split: L.SplitSquareHorizontal,
    ResizeHandle: L.GripVertical,
};

const crmIcons = {
  // CRM specific icons
  CheckCircle: L.CheckCircle,
  XCircle: L.X, // Using X as XCircle equivalent
  FolderOpen: L.Folder,
  BarChart: L.BarChart,
  Clock: L.Clock,
  Star: L.Star,
  ThumbsUp: L.Heart, // Using Heart as ThumbsUp equivalent
  MessageSquare: L.MessageSquare,
  Heart: L.Heart,
  Flame: L.TrendingUp, // Using TrendingUp as Flame equivalent
  Target: L.Target,
  Calendar: L.CalendarDays,
  FileText: L.FileText,
  Layout: L.LayoutTemplate,
  Database: L.Database,
  Cpu: L.Cpu,
  HardDrive: L.Database, // Using Database as HardDrive equivalent
  Wifi: L.Globe, // Using Globe as Wifi equivalent
  RefreshCw: L.RotateCw,
  RotateCcw: L.Undo2,
  Square: L.PlusSquare, // Using PlusSquare as Square equivalent
  Play: L.Play,
  Filter: L.Filter,
  UserPlus: L.UserPlus,
  UserCheck: L.UserCheck,
  Minimize: L.Minus,
  ArrowLeft: L.ChevronLeft,
  MousePointer: L.MousePointer2,
  Zap: L.Activity, // Using Activity as Zap equivalent
  AlertTriangle: L.AlertTriangle,
  Download: L.Download,
  GraduationCap: L.GraduationCap,
  CreditCard: L.CreditCard,
  MessageSquare: L.MessageSquare,
  BookCopy: L.BookCopy,
  Bot: L.Bot,
  Activity: L.Activity,
  Users: L.Users,
  FileText: L.FileText,
};

export const Icons = {
  ...sharedIcons,
  ...schoolIcons,
  ...administrationIcons,
  ...teacherIcons,
  ...studentIcons,
  ...parentIcons,
  ...marketingIcons,
  ...financeIcons,
  ...gamificationIcons,
  ...marketplaceIcons,
  ...hobbiesIcons,
  ...videoIcons,
  ...crmIcons,
};