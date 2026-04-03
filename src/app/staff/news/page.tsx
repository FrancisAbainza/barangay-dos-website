"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Megaphone, AlertTriangle, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { NewsPost } from "@/components/news/types";
import { PostFeed } from "@/components/news/post-feed";
import { PinnedPostsPanel } from "@/components/news/pinned-posts-panel";
import { SavedPostsSidebar } from "@/components/news/saved-posts-sidebar";
import { CreateNewsDialog } from "@/components/news/create-news-dialog";
import { useBarangayProfile } from "@/contexts/barangay-profile-context";

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_POSTS: NewsPost[] = [
  {
    id: "1",
    title: "Barangay Assembly Meeting — 2nd Quarter 2026",
    content:
      "Dear residents of Barangay Milagrosa, you are cordially invited to attend the 2nd Quarter Barangay Assembly on April 15, 2026 at 9:00 AM at the Barangay Hall. Your attendance and participation are highly encouraged.\n\nAgenda topics include: Budget Report for Q1 2026, Updates on the Flood Control Project, and Open Forum for Resident Concerns. Snacks will be provided. We hope to see everyone there!",
    images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
    ],
    authorName: "Bgy. Captain Juan dela Cruz",
    authorAvatarUrl: undefined,
    authorRole: "Super Admin",
    date: new Date("2026-04-01T08:00:00"),
    category: "Announcement",
    pinned: true,
    likes: 47,
    dislikes: 2,
    comments: [
      {
        id: "c1",
        authorName: "Maria Santos",
        content: "Thank you for the update! Will definitely attend.",
        date: new Date("2026-04-01T09:15:00"),
        replies: [
          {
            id: "r1",
            authorName: "Bgy. Captain Juan dela Cruz",
            content: "We'll be very happy to see you there, Ma'am Maria!",
            date: new Date("2026-04-01T09:30:00"),
          },
        ],
      },
      {
        id: "c2",
        authorName: "Pedro Reyes",
        content: "Will there be parking available near the barangay hall?",
        date: new Date("2026-04-01T10:00:00"),
        replies: [],
      },
    ],
    attachments: [
      {
        id: "a1",
        name: "Assembly_Agenda_Q2_2026.pdf",
        url: "#",
        size: "245 KB",
      },
    ],
  },
  {
    id: "2",
    title: "Typhoon Preparedness Advisory — Be Ready!",
    content:
      "EMERGENCY ADVISORY: A tropical storm is expected to make landfall within the next 48 hours. Residents are advised to:\n\n• Stock up on food, water, and medicines for at least 3 days.\n• Secure loose objects around your homes.\n• Follow advisories from PAGASA.\n• All residents living in low-lying and flood-prone areas should prepare for possible evacuation.\n\nThe Barangay Emergency Response Team (BERT) is on standby. For emergency assistance, please contact the Barangay Hotline: 0917-XXX-XXXX.",
    images: undefined,
    authorName: "BERT Coordinator Lito Bautista",
    authorAvatarUrl: undefined,
    authorRole: "Admin",
    date: new Date("2026-04-02T14:30:00"),
    category: "Emergency",
    likes: 132,
    dislikes: 1,
    comments: [
      {
        id: "c3",
        authorName: "Ana Villanueva",
        content: "Stay safe everyone! Let's help each other.",
        date: new Date("2026-04-02T15:00:00"),
        replies: [
          {
            id: "r2",
            authorName: "Rodrigo Garcia",
            content: "Agreed! Neighbors, let's check on our elderly.",
            date: new Date("2026-04-02T15:10:00"),
          },
        ],
      },
    ],
    attachments: [
      {
        id: "a2",
        name: "PAGASA_Weather_Bulletin_April_2026.pdf",
        url: "#",
        size: "1.2 MB",
      },
      {
        id: "a3",
        name: "Evacuation_Map_Barangay_Milagrosa.pdf",
        url: "#",
        size: "890 KB",
      },
    ],
  },
  {
    id: "3",
    title: "Pasko sa Barangay 2026 — Join the Fun!",
    content:
      "Get ready for the most awaited event of the year! Barangay Milagrosa's annual Pasko sa Barangay celebration is happening on December 20, 2026 at 5:00 PM at the Barangay Plaza.\n\nJoin us for:\n🎤 Live Musical Performances\n🏆 Best Decorated Home Contest\n🎁 Gift Giving for Children\n🍽️ Community Feast\n🎆 Fireworks Display\n\nAll residents are welcome. Bring your family and friends for a night full of fun, food, and celebration!",
    images: [
      "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800",
      "https://images.unsplash.com/photo-1481026469463-66327c86e544?w=800",
      "https://images.unsplash.com/photo-1513267048331-5611cad62e41?w=800",
    ],
    authorName: "Bgy. Secretary Rosa Mendoza",
    authorAvatarUrl: undefined,
    authorRole: "Admin",
    date: new Date("2026-03-28T10:00:00"),
    category: "Event",
    likes: 215,
    dislikes: 3,
    comments: [
      {
        id: "c4",
        authorName: "Josefina Cruz",
        content:
          "So excited for this! My kids are already asking what costumes to wear 😂",
        date: new Date("2026-03-28T11:30:00"),
        replies: [
          {
            id: "r3",
            authorName: "Bgy. Secretary Rosa Mendoza",
            content:
              "That's the spirit, Ma'am! See you and your family there! 🎉",
            date: new Date("2026-03-28T11:45:00"),
          },
        ],
      },
      {
        id: "c5",
        authorName: "Roberto Flores",
        content: "Will there be raffle draws? Hope so!",
        date: new Date("2026-03-29T09:00:00"),
        replies: [],
      },
      {
        id: "c6",
        authorName: "Carmen Diaz",
        content:
          "Thank you Barangay Milagrosa for organizing this every year!",
        date: new Date("2026-03-30T13:20:00"),
        replies: [],
      },
    ],
    attachments: undefined,
  },
  {
    id: "4",
    title: "Free Medical and Dental Mission — April 10, 2026",
    content:
      "Barangay Milagrosa, in coordination with the City Health Office, will be conducting a FREE Medical and Dental Mission on April 10, 2026 from 8:00 AM to 5:00 PM at the Barangay Multi-Purpose Hall.\n\nServices available:\n• General Check-up\n• Blood Pressure Monitoring\n• Blood Sugar Testing\n• Dental Extraction\n• Free Medicines (while stocks last)\n\nAll residents are welcome. Please bring a valid ID and Barangay Clearance. First-come, first-served basis.",
    images: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    ],
    authorName: "Health Committee Chair Dr. Elena Soriano",
    authorAvatarUrl: undefined,
    authorRole: "Admin",
    date: new Date("2026-04-03T07:00:00"),
    category: "Event",
    likes: 88,
    dislikes: 0,
    comments: [
      {
        id: "c7",
        authorName: "Nena Buenaventura",
        content: "This is very helpful! Thank you, Barangay Milagrosa!",
        date: new Date("2026-04-03T08:00:00"),
        replies: [],
      },
    ],
    attachments: [
      {
        id: "a4",
        name: "Medical_Mission_Schedule.pdf",
        url: "#",
        size: "320 KB",
      },
    ],
  },
  {
    id: "5",
    title: "Reminder: Observe Proper Waste Segregation",
    content:
      "As part of our commitment to keeping Barangay Milagrosa clean, all residents are reminded to properly segregate their waste — biodegradable, non-biodegradable, and residual — before collection day. Garbage trucks will no longer collect unsegregated waste starting May 1, 2026. Let us all cooperate for a cleaner and greener barangay!",
    authorName: "Bgy. Captain Juan dela Cruz",
    authorAvatarUrl: undefined,
    authorRole: "Super Admin",
    date: new Date("2026-03-25T09:00:00"),
    category: "Announcement",
    pinned: true,
    likes: 63,
    dislikes: 0,
    comments: [],
    attachments: undefined,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const { userProfile } = useAuth();
  const currentUserName = userProfile?.fullName ?? "Guest User";
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set(["2", "4"]));
  const { barangayName } = useBarangayProfile();

  const pinnedPosts = DUMMY_POSTS.filter((p) => p.pinned);

  function toggleSave(id: string) {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const announcementPosts = DUMMY_POSTS.filter(
    (p) => p.category === "Announcement"
  );
  const eventPosts = DUMMY_POSTS.filter((p) => p.category === "Event");
  const emergencyPosts = DUMMY_POSTS.filter((p) => p.category === "Emergency");

  return (
    <div className="container space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-accent text-primary p-2 rounded-md">
            <Megaphone />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              News &amp; Announcements
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stay informed with the latest updates from {barangayName}.
            </p>
          </div>
        </div>
        <CreateNewsDialog />
      </div>

      {/* ── Pinned + Saved: shown below xl; stacked vertically ── */}
      <div className="xl:hidden space-y-4">
        {pinnedPosts.length > 0 && (
          <PinnedPostsPanel
            posts={pinnedPosts}
            savedPostIds={savedPostIds}
            onToggleSave={toggleSave}
            currentUserName={currentUserName}
          />
        )}
        <SavedPostsSidebar
          posts={DUMMY_POSTS}
          savedPostIds={savedPostIds}
          onRemove={toggleSave}
          currentUserName={currentUserName}
        />
      </div>

      <div className="flex gap-6 items-start">
        {/* Left sidebar (Pinned) - visible at xl+ */}
        <aside className="hidden xl:flex w-64 shrink-0 flex-col gap-3 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
          <PinnedPostsPanel
            posts={pinnedPosts}
            savedPostIds={savedPostIds}
            onToggleSave={toggleSave}
            currentUserName={currentUserName}
          />
        </aside>

        {/* ── Main Feed ── */}
        <div className="flex-1 min-w-0 space-y-4">
          <Tabs defaultValue="all">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="announcement" className="flex-1 gap-1.5">
                <Megaphone className="size-3.5" />
                <span className="hidden sm:inline">Announcements</span>
                <span className="sm:hidden">Posts</span>
              </TabsTrigger>
              <TabsTrigger value="event" className="flex-1 gap-1.5">
                <CalendarDays className="size-3.5" />
                <span className="hidden sm:inline">Events</span>
                <span className="sm:hidden">Events</span>
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex-1 gap-1.5">
                <AlertTriangle className="size-3.5" />
                <span className="hidden sm:inline">Emergency</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-5">
              <PostFeed
                posts={DUMMY_POSTS}
                currentUserName={currentUserName}
                savedPostIds={savedPostIds}
                onToggleSave={toggleSave}
              />
            </TabsContent>

            <TabsContent value="announcement" className="mt-5">
              <PostFeed
                posts={announcementPosts}
                currentUserName={currentUserName}
                savedPostIds={savedPostIds}
                onToggleSave={toggleSave}
              />
            </TabsContent>

            <TabsContent value="event" className="mt-5">
              <PostFeed
                posts={eventPosts}
                currentUserName={currentUserName}
                savedPostIds={savedPostIds}
                onToggleSave={toggleSave}
              />
            </TabsContent>

            <TabsContent value="emergency" className="mt-5">
              <PostFeed
                posts={emergencyPosts}
                currentUserName={currentUserName}
                savedPostIds={savedPostIds}
                onToggleSave={toggleSave}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Right Sidebar (Saved Posts) ── */}
        <aside className="hidden xl:flex w-64 shrink-0 flex-col gap-3 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
          <SavedPostsSidebar
            posts={DUMMY_POSTS}
            savedPostIds={savedPostIds}
            onRemove={toggleSave}
            currentUserName={currentUserName}
          />
        </aside>
      </div>
    </div>
  );
}
