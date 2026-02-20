'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, 
  Plus, 
  GridIcon, 
  List as ListIcon,
  Folder,
  Star,
  StarOff,
  MoreVertical,
  ExternalLink,
  Trash2,
  FolderPlus,
  X,
  Bookmark as BookmarkIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/DropdownMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Bookmark } from "@shared/schema";
import { classNames } from "@/utils/classNames";
import styles from './bookmarks.module.css';

type ViewMode = "grid" | "list";
type BookmarkFolder = "all" | "teaching" | "research" | "personal" | "unfiled";

export default function BookmarksPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentFolder, setCurrentFolder] = useState<BookmarkFolder>("all");
  const [starredFilter, setStarredFilter] = useState(false);
  
  const { data: bookmarks, isLoading } = useQuery<Bookmark[]>({
    queryKey: ["/api/bookmarks/1"] // Assuming current user ID is 1
  });
  
  // Filter bookmarks based on search, folder, and starred status
  const filteredBookmarks = bookmarks?.filter(bookmark => 
    bookmark.title.toLowerCase().includes(search.toLowerCase()) &&
    (currentFolder === "all" || bookmark.category === currentFolder) &&
    (!starredFilter || bookmark.id % 3 === 0) // Mock starred status for demo
  ) || [];
  
  // Folder colors for visual distinction
  const getFolderColor = (folder: BookmarkFolder) => {
    switch (folder) {
      case "teaching":
        return styles.folderBlue;
      case "research":
        return styles.folderPurple;
      case "personal":
        return styles.folderGreen;
      case "unfiled":
        return styles.folderGray;
      default:
        return styles.folderPrimary;
    }
  };
  
  const folders: { id: BookmarkFolder; name: string; count: number }[] = [
    { id: "all", name: "All Bookmarks", count: bookmarks?.length || 0 },
    { id: "teaching", name: "Teaching Materials", count: bookmarks?.filter(b => b.category === "teaching").length || 0 },
    { id: "research", name: "Research Resources", count: bookmarks?.filter(b => b.category === "research").length || 0 },
    { id: "personal", name: "Personal Resources", count: bookmarks?.filter(b => b.category === "personal").length || 0 },
    { id: "unfiled", name: "Unfiled Bookmarks", count: bookmarks?.filter(b => !b.category || b.category === "unfiled").length || 0 },
  ];
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Bookmarks</h1>
          <p className={styles.subtitle}>Your saved educational resources</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" className={styles.newFolderButton}>
            <FolderPlus className={styles.actionIcon} />
            New Folder
          </Button>
          <Button className={styles.addButton}>
            <Plus className={styles.actionIcon} />
            Add Bookmark
          </Button>
        </div>
      </div>
      
      <div className={styles.contentGrid}>
        {/* Folders sidebar */}
        <div className={styles.sidebar}>
          <Card className={styles.foldersCard}>
            <CardHeader className={styles.foldersHeader}>
              <h2 className={styles.foldersTitle}>Folders</h2>
            </CardHeader>
            <CardContent className={styles.foldersContent}>
              <div className={styles.foldersList}>
                {folders.map((folder) => (
                  <Button
                    key={folder.id}
                    variant="ghost"
                    className={classNames(
                      styles.folderButton,
                      currentFolder === folder.id && styles.folderButtonActive
                    )}
                    onClick={() => setCurrentFolder(folder.id)}
                  >
                    <Folder className={styles.folderIcon} />
                    <span className={styles.folderName}>{folder.name}</span>
                    <Badge variant="secondary" className={styles.folderBadge}>
                      {folder.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className={styles.starredSection}>
            <Button
              variant={starredFilter ? "secondary" : "outline"}
              className={styles.starredButton}
              onClick={() => setStarredFilter(!starredFilter)}
            >
              <Star className={classNames(styles.starredIcon, starredFilter && styles.starredIconActive)} />
              {starredFilter ? "Showing Starred" : "Show Starred"}
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className={styles.mainContent}>
          <Card className={styles.bookmarksCard}>
            <CardHeader className={styles.bookmarksHeader}>
              <div className={styles.bookmarksHeaderContent}>
                <div className={styles.bookmarksSearch}>
                  <Search className={styles.bookmarksSearchIcon} />
                  <Input
                    placeholder="Search bookmarks..."
                    className={styles.bookmarksSearchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={styles.clearSearchButton}
                      onClick={() => setSearch("")}
                    >
                      <X className={styles.clearSearchIcon} />
                    </Button>
                  )}
                </div>
                <div className={styles.viewToggle}>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className={classNames(styles.viewButton, styles.viewButtonLeft)}
                    onClick={() => setViewMode("grid")}
                  >
                    <GridIcon className={styles.viewIcon} />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className={classNames(styles.viewButton, styles.viewButtonRight)}
                    onClick={() => setViewMode("list")}
                  >
                    <ListIcon className={styles.viewIcon} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className={styles.bookmarksContent}>
              {isLoading ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <BookmarkIcon className={styles.emptyIcon} />
                  </div>
                  <h3 className={styles.emptyStateTitle}>Loading bookmarks...</h3>
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className={styles.emptyState}>
                  {search || currentFolder !== "all" || starredFilter ? (
                    <>
                      <div className={styles.emptyStateIcon}>
                        <Search className={styles.emptyIcon} />
                      </div>
                      <h3 className={styles.emptyStateTitle}>No bookmarks found</h3>
                      <p className={styles.emptyStateDescription}>
                        Try adjusting your search or filter criteria
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearch("");
                          setCurrentFolder("all");
                          setStarredFilter(false);
                        }}
                        className={styles.emptyStateButton}
                      >
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyStateIcon}>
                        <BookmarkIcon className={styles.emptyIcon} />
                      </div>
                      <h3 className={styles.emptyStateTitle}>No bookmarks yet</h3>
                      <p className={styles.emptyStateDescription}>
                        Save your favorite educational resources for quick access
                      </p>
                      <Button
                        className={styles.emptyStateButton}
                        onClick={() => {
                          // Add bookmark functionality would go here
                        }}
                      >
                        <Plus className={styles.emptyStateButtonIcon} />
                        Add Bookmark
                      </Button>
                    </>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className={styles.bookmarksGrid}>
                  {filteredBookmarks.map((bookmark) => {
                    const isStarred = bookmark.id % 3 === 0; // Mock starred status for demo
                    const folderColor = getFolderColor(bookmark.category as BookmarkFolder || "unfiled");
                    
                    return (
                      <div key={bookmark.id} className={styles.bookmarkCard}>
                        <div className={classNames(styles.bookmarkCardHeader, folderColor)}></div>
                        <div className={styles.bookmarkCardContent}>
                          <div className={styles.bookmarkCardTop}>
                            <h3 className={styles.bookmarkTitle}>{bookmark.title}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={styles.starButton}
                              onClick={() => {/* Toggle star in real app */}}
                            >
                              {isStarred ? <Star className={styles.starIconFilled} /> : <StarOff className={styles.starIcon} />}
                            </Button>
                          </div>
                          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className={styles.bookmarkUrl}>
                            {bookmark.url}
                            <ExternalLink className={styles.bookmarkUrlIcon} />
                          </a>
                          <div className={styles.bookmarkCardFooter}>
                            <Badge variant="outline" className={styles.bookmarkBadge}>
                              {bookmark.category || "unfiled"}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className={styles.bookmarkMenuButton}>
                                  <MoreVertical className={styles.bookmarkMenuIcon} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <ExternalLink className={styles.dropdownIcon} />
                                  Open Link
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FolderPlus className={styles.dropdownIcon} />
                                  Move to Folder
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {isStarred ? (
                                    <>
                                      <StarOff className={styles.dropdownIcon} />
                                      Remove Star
                                    </>
                                  ) : (
                                    <>
                                      <Star className={styles.dropdownIcon} />
                                      Add Star
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className={styles.deleteItem}>
                                  <Trash2 className={styles.dropdownIcon} />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.bookmarksList}>
                  {filteredBookmarks.map((bookmark) => {
                    const isStarred = bookmark.id % 3 === 0; // Mock starred status for demo
                    
                    return (
                      <div key={bookmark.id} className={styles.bookmarkListItem}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={styles.listStarButton}
                          onClick={() => {/* Toggle star in real app */}}
                        >
                          {isStarred ? <Star className={styles.starIconFilled} /> : <StarOff className={styles.starIcon} />}
                        </Button>
                        <div className={styles.bookmarkListInfo}>
                          <h3 className={styles.bookmarkListTitle}>{bookmark.title}</h3>
                          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className={styles.bookmarkListUrl}>
                            {bookmark.url}
                            <ExternalLink className={styles.bookmarkListUrlIcon} />
                          </a>
                        </div>
                        <div className={styles.bookmarkListActions}>
                          <Badge variant="outline" className={styles.bookmarkListBadge}>
                            {bookmark.category || "unfiled"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className={styles.bookmarkListMenuButton}>
                                <MoreVertical className={styles.bookmarkListMenuIcon} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <ExternalLink className={styles.dropdownIcon} />
                                Open Link
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FolderPlus className={styles.dropdownIcon} />
                                Move to Folder
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {isStarred ? (
                                  <>
                                    <StarOff className={styles.dropdownIcon} />
                                    Remove Star
                                  </>
                                ) : (
                                  <>
                                    <Star className={styles.dropdownIcon} />
                                    Add Star
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className={styles.deleteItem}>
                                <Trash2 className={styles.dropdownIcon} />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
