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
};