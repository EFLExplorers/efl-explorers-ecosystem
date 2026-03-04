'use client';

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { 
  Search, 
  Plus, 
  GridIcon, 
  List as ListIcon,
  Download,
  ExternalLink,
  Star,
  Bookmark,
  MoreVertical,
  Folder,
  FileText,
  Video,
  Image,
  Link as LinkIcon,
  Filter,
  Eye,
  ArrowUpDown,
  X,
  Calendar,
  HardDrive,
  Upload
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/DropdownMenu";
import { Separator } from "@/components/ui/Separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Material } from "@shared/schema";
import { classNames } from "@/utils/classNames";
import { formatDistanceToNow } from "date-fns";
import styles from './materials.module.css';

type ViewMode = "grid" | "list";
type CategoryFilter = "all" | "documents" | "videos" | "images" | "links" | "other";
type SortBy = "name" | "date" | "category" | "size";
type SortOrder = "asc" | "desc";

export default function MaterialsPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  
  const { data: materials, isLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials"]
  });
  
  // Helper function to determine category from URL
  const getCategoryFromUrl = (url: string): CategoryFilter => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.pdf') || lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.txt')) {
      return "documents";
    } else if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.avi') || lowerUrl.endsWith('.mov') || lowerUrl.includes('youtube.com') || lowerUrl.includes('vimeo.com')) {
      return "videos";
    } else if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.gif') || lowerUrl.endsWith('.webp')) {
      return "images";
    } else if (lowerUrl.startsWith('http') || lowerUrl.startsWith('www')) {
      return "links";
    } else {
      return "other";
    }
  };

  // Get file size (mock for now - would come from metadata)
  const getFileSize = (url: string): string => {
    // Mock sizes based on category
    const category = getCategoryFromUrl(url);
    const sizes: Record<CategoryFilter, string> = {
      all: "0 KB",
      documents: "2.4 MB",
      videos: "15.8 MB",
      images: "1.2 MB",
      links: "0 KB",
      other: "0.5 MB"
    };
    return sizes[category] || "0 KB";
  };

  // Get formatted date
  const getFormattedDate = (date: Date | string | null | undefined): string => {
    if (!date) return "Unknown";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  // Check if material is recently added (within 7 days)
  const isRecentlyAdded = (date: Date | string | null | undefined): boolean => {
    if (!date) return false;
    try {
      const materialDate = new Date(date);
      const daysDiff = (Date.now() - materialDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    } catch {
      return false;
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category: CategoryFilter) => {
    switch (category) {
      case "documents":
        return <FileText className={styles.categoryIcon} />;
      case "videos":
        return <Video className={styles.categoryIcon} />;
      case "images":
        return <Image className={styles.categoryIcon} />;
      case "links":
        return <LinkIcon className={styles.categoryIcon} />;
      default:
        return <Folder className={styles.categoryIcon} />;
    }
  };
  
  // Get color based on category
  const getCategoryColor = (category: CategoryFilter) => {
    switch (category) {
      case "documents":
        return styles.categoryBlue;
      case "videos":
        return styles.categoryPurple;
      case "images":
        return styles.categoryGreen;
      case "links":
        return styles.categoryOrange;
      default:
        return styles.categoryGray;
    }
  };

  // Filter and sort materials
  const filteredAndSortedMaterials = useMemo(() => {
    if (!materials) return [];

    let filtered = materials.filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(search.toLowerCase()) ||
                           (material.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesCategory = categoryFilter === "all" || getCategoryFromUrl(material.url) === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Sort materials
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date":
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "size":
          // Mock size comparison
          const sizeA = getFileSize(a.url);
          const sizeB = getFileSize(b.url);
          comparison = sizeA.localeCompare(sizeB);
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [materials, search, categoryFilter, sortBy, sortOrder]);

  // Get category counts
  const categoryCounts = useMemo((): Record<CategoryFilter, number> => {
    if (!materials) {
      return {
        all: 0,
        documents: 0,
        videos: 0,
        images: 0,
        links: 0,
        other: 0
      };
    }
    const counts: Record<CategoryFilter, number> = {
      all: materials.length,
      documents: 0,
      videos: 0,
      images: 0,
      links: 0,
      other: 0
    };
    materials.forEach(material => {
      const category = getCategoryFromUrl(material.url);
      counts[category]++;
    });
    return counts;
  }, [materials]);
  
  const categories = [
    { id: "all" as CategoryFilter, label: "All Materials", icon: Folder, count: categoryCounts.all },
    { id: "documents" as CategoryFilter, label: "Documents", icon: FileText, count: categoryCounts.documents },
    { id: "videos" as CategoryFilter, label: "Videos", icon: Video, count: categoryCounts.videos },
    { id: "images" as CategoryFilter, label: "Images", icon: Image, count: categoryCounts.images },
    { id: "links" as CategoryFilter, label: "Links", icon: LinkIcon, count: categoryCounts.links },
    { id: "other" as CategoryFilter, label: "Other", icon: Folder, count: categoryCounts.other },
  ];

  // Preview component
  const renderPreview = () => {
    if (!previewMaterial) return null;
    
    const category = getCategoryFromUrl(previewMaterial.url);
    const isImage = category === "images";
    const isVideo = category === "videos";
    const isPDF = previewMaterial.url.toLowerCase().endsWith('.pdf');
    const isLink = category === "links";

    return (
      <Dialog open={!!previewMaterial} onOpenChange={(open) => !open && setPreviewMaterial(null)}>
        <DialogContent className={styles.previewDialog}>
          <DialogHeader>
            <DialogTitle className={styles.previewTitle}>{previewMaterial.title}</DialogTitle>
          </DialogHeader>
          
          <div className={styles.previewContent}>
            {isImage && (
              <div className={styles.previewImageContainer}>
                <img 
                  src={previewMaterial.url} 
                  alt={previewMaterial.title}
                  className={styles.previewImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {isVideo && (
              <div className={styles.previewVideoContainer}>
                <video 
                  src={previewMaterial.url} 
                  controls
                  className={styles.previewVideo}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            {isPDF && (
              <div className={styles.previewPDFContainer}>
                <iframe 
                  src={previewMaterial.url}
                  className={styles.previewPDF}
                  title={previewMaterial.title}
                />
                <div className={styles.previewPDFFallback}>
                  <FileText className={styles.previewPDFIcon} />
                  <p>PDF Preview</p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(previewMaterial.url, '_blank')}
                    className={styles.previewPDFButton}
                  >
                    Open in New Tab
                  </Button>
                </div>
              </div>
            )}
            
            {isLink && (
              <div className={styles.previewLinkContainer}>
                <ExternalLink className={styles.previewLinkIcon} />
                <p className={styles.previewLinkText}>{previewMaterial.url}</p>
                <Button 
                  variant="outline"
                  onClick={() => window.open(previewMaterial.url, '_blank')}
                  className={styles.previewLinkButton}
                >
                  Open Link
                </Button>
              </div>
            )}
            
            {!isImage && !isVideo && !isPDF && !isLink && (
              <div className={styles.previewDocumentContainer}>
                <FileText className={styles.previewDocumentIcon} />
                <p className={styles.previewDocumentText}>
                  Preview not available for this file type. Download to view.
                </p>
              </div>
            )}
            
            {previewMaterial.description && (
              <div className={styles.previewDescription}>
                <p className={styles.previewDescriptionLabel}>Description:</p>
                <p className={styles.previewDescriptionText}>{previewMaterial.description}</p>
              </div>
            )}
            
            <div className={styles.previewMetadata}>
              <div className={styles.previewMetadataItem}>
                <span className={styles.previewMetadataLabel}>Category:</span>
                <Badge variant="outline" className={styles.previewBadge}>
                  {previewMaterial.category}
                </Badge>
              </div>
              <div className={styles.previewMetadataItem}>
                <span className={styles.previewMetadataLabel}>Added:</span>
                <span className={styles.previewMetadataValue}>
                  {getFormattedDate(previewMaterial.createdAt)}
                </span>
              </div>
              <div className={styles.previewMetadataItem}>
                <span className={styles.previewMetadataLabel}>Size:</span>
                <span className={styles.previewMetadataValue}>
                  {getFileSize(previewMaterial.url)}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className={styles.previewFooter}>
            <Button 
              variant="outline"
              onClick={() => window.open(previewMaterial.url, '_blank')}
            >
              <ExternalLink className={styles.previewActionIcon} />
              Open
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = previewMaterial.url;
                link.download = previewMaterial.title;
                link.click();
              }}
            >
              <Download className={styles.previewActionIcon} />
              Download
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Bookmark functionality would go here
              }}
            >
              <Bookmark className={styles.previewActionIcon} />
              Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Educational Materials</h1>
          <p className={styles.subtitle}>Browse and manage your teaching resources</p>
        </div>
        <div className={styles.headerAction}>
          <Button className={styles.uploadButton}>
            <Plus className={styles.uploadIcon} />
            Upload Material
          </Button>
        </div>
      </div>
      
      <div className={styles.contentGrid}>
        {/* Categories sidebar */}
        <div className={styles.sidebar}>
          <Card className={styles.categoriesCard}>
            <CardHeader className={styles.categoriesHeader}>
              <h2 className={styles.categoriesTitle}>Categories</h2>
            </CardHeader>
            <CardContent className={styles.categoriesContent}>
              <div className={styles.categoriesList}>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={categoryFilter === category.id ? "secondary" : "ghost"}
                    className={classNames(
                      styles.categoryButton,
                      categoryFilter === category.id && styles.categoryButtonActive
                    )}
                    onClick={() => setCategoryFilter(category.id)}
                  >
                    <category.icon className={styles.categoryButtonIcon} />
                    <span className={styles.categoryButtonLabel}>{category.label}</span>
                    {category.count > 0 && (
                      <span className={styles.categoryButtonCount}>({category.count})</span>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className={styles.storageCard}>
            <CardHeader className={styles.storageHeader}>
              <h2 className={styles.storageTitle}>Storage</h2>
            </CardHeader>
            <CardContent className={styles.storageContent}>
              <div className={styles.storageSection}>
                <div className={styles.storageInfo}>
                  <div className={styles.storageLabel}>
                    <span>Used</span>
                    <span className={styles.storageValue}>4.8 GB of 10 GB</span>
                  </div>
                  <div className={styles.storageBar}>
                    <div className={styles.storageBarFill} style={{ width: '48%' }}></div>
                  </div>
                </div>
                <Separator className={styles.storageSeparator} />
                <div className={styles.storageBreakdown}>
                  <div className={styles.storageItem}>
                    <span className={styles.storageItemLabel}>
                      <div className={classNames(styles.storageDot, styles.storageDotBlue)}></div>
                      <span>Documents</span>
                    </span>
                    <span className={styles.storageItemValue}>2.1 GB</span>
                  </div>
                  <div className={styles.storageItem}>
                    <span className={styles.storageItemLabel}>
                      <div className={classNames(styles.storageDot, styles.storageDotPurple)}></div>
                      <span>Videos</span>
                    </span>
                    <span className={styles.storageItemValue}>1.9 GB</span>
                  </div>
                  <div className={styles.storageItem}>
                    <span className={styles.storageItemLabel}>
                      <div className={classNames(styles.storageDot, styles.storageDotGreen)}></div>
                      <span>Images</span>
                    </span>
                    <span className={styles.storageItemValue}>0.6 GB</span>
                  </div>
                  <div className={styles.storageItem}>
                    <span className={styles.storageItemLabel}>
                      <div className={classNames(styles.storageDot, styles.storageDotGray)}></div>
                      <span>Other</span>
                    </span>
                    <span className={styles.storageItemValue}>0.2 GB</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className={styles.mainContent}>
          <Card className={styles.materialsCard}>
            <CardHeader className={styles.materialsHeader}>
              <div className={styles.materialsHeaderContent}>
                <div className={styles.materialsSearch}>
                  <Search className={styles.materialsSearchIcon} />
                  <Input
                    placeholder="Search materials..."
                    className={styles.materialsSearchInput}
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
                <div className={styles.materialsActions}>
                  <div className={styles.sortContainer}>
                    <ArrowUpDown className={styles.sortIcon} />
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                      <SelectTrigger className={styles.sortSelect}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="date">Date Added</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className={styles.sortOrderButton}
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      title={sortOrder === "asc" ? "Sort ascending (A-Z, Oldest first)" : "Sort descending (Z-A, Newest first)"}
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  </div>
                  <div className={styles.mobileFilter}>
                    <Button variant="outline" size="sm" className={styles.filterButton}>
                      <Filter className={styles.filterIcon} />
                      Filter
                    </Button>
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
              </div>
            </CardHeader>
            
            <CardContent className={styles.materialsContent}>
              {isLoading ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <HardDrive className={styles.emptyIcon} />
                  </div>
                  <h3 className={styles.emptyStateTitle}>Loading materials...</h3>
                </div>
              ) : filteredAndSortedMaterials.length === 0 ? (
                <div className={styles.emptyState}>
                  {search || categoryFilter !== "all" ? (
                    <>
                      <div className={styles.emptyStateIcon}>
                        <Search className={styles.emptyIcon} />
                      </div>
                      <h3 className={styles.emptyStateTitle}>No materials found</h3>
                      <p className={styles.emptyStateDescription}>
                        Try adjusting your search or filter criteria
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearch("");
                          setCategoryFilter("all");
                        }}
                        className={styles.emptyStateButton}
                      >
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyStateIcon}>
                        <Upload className={styles.emptyIcon} />
                      </div>
                      <h3 className={styles.emptyStateTitle}>No materials yet</h3>
                      <p className={styles.emptyStateDescription}>
                        Upload your first material to get started
                      </p>
                      <Button
                        className={styles.emptyStateButton}
                        onClick={() => {
                          // Upload functionality would go here
                        }}
                      >
                        <Plus className={styles.emptyStateButtonIcon} />
                        Upload Material
                      </Button>
                    </>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className={styles.materialsGrid}>
                  {filteredAndSortedMaterials.map((material) => {
                    const category = getCategoryFromUrl(material.url);
                    const categoryColorClass = getCategoryColor(category);
                    const recentlyAdded = isRecentlyAdded(material.createdAt);
                    const isImage = category === "images";
                    
                    return (
                      <div key={material.id} className={styles.materialCard}>
                        <div className={classNames(styles.materialCardHeader, categoryColorClass)}>
                          {isImage ? (
                            <img 
                              src={material.url} 
                              alt={material.title}
                              className={styles.materialThumbnail}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove(styles.hidden);
                              }}
                            />
                          ) : null}
                          <div className={classNames(styles.materialCardHeaderIcon, !isImage && styles.visible)}>
                            {getCategoryIcon(category)}
                          </div>
                          {recentlyAdded && (
                            <div className={styles.recentBadge}>
                              <span>New</span>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={styles.previewButton}
                            onClick={() => setPreviewMaterial(material)}
                          >
                            <Eye className={styles.previewButtonIcon} />
                          </Button>
                        </div>
                        <div className={styles.materialCardContent}>
                          <div className={styles.materialCardTop}>
                            <h3 className={styles.materialTitle}>{material.title}</h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className={styles.materialMenuButton}>
                                  <MoreVertical className={styles.materialMenuIcon} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setPreviewMaterial(material)}>
                                  <Eye className={styles.dropdownIcon} />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className={styles.dropdownIcon} />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Bookmark className={styles.dropdownIcon} />
                                  Bookmark
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Star className={styles.dropdownIcon} />
                                  Add to Favorites
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className={styles.deleteItem}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className={styles.materialDescription}>
                            {material.description || "No description available"}
                          </p>
                          <div className={styles.materialCardMeta}>
                            <div className={styles.materialCardMetaItem}>
                              <Calendar className={styles.materialCardMetaIcon} />
                              <span className={styles.materialCardMetaText}>
                                {getFormattedDate(material.createdAt)}
                              </span>
                            </div>
                            <div className={styles.materialCardMetaItem}>
                              <HardDrive className={styles.materialCardMetaIcon} />
                              <span className={styles.materialCardMetaText}>
                                {getFileSize(material.url)}
                              </span>
                            </div>
                          </div>
                          <div className={styles.materialCardFooter}>
                            <Badge variant="outline" className={styles.materialBadge}>
                              {material.category}
                            </Badge>
                            <div className={styles.materialCardFooterActions}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={styles.materialLinkButton}
                                onClick={() => setPreviewMaterial(material)}
                              >
                                <Eye className={styles.materialLinkIcon} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={styles.materialLinkButton}
                                onClick={() => window.open(material.url, '_blank')}
                              >
                                <ExternalLink className={styles.materialLinkIcon} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.materialsList}>
                  {filteredAndSortedMaterials.map((material) => {
                    const category = getCategoryFromUrl(material.url);
                    const categoryColorClass = getCategoryColor(category);
                    const recentlyAdded = isRecentlyAdded(material.createdAt);
                    
                    return (
                      <div key={material.id} className={styles.materialListItem}>
                        <div className={classNames(styles.materialListIcon, categoryColorClass)}>
                          {getCategoryIcon(category)}
                        </div>
                        <div className={styles.materialListInfo}>
                          <div className={styles.materialListInfoHeader}>
                            <h3 className={styles.materialListTitle}>{material.title}</h3>
                            {recentlyAdded && (
                              <Badge variant="outline" className={styles.recentListBadge}>
                                New
                              </Badge>
                            )}
                          </div>
                          <p className={styles.materialListDescription}>
                            {material.description || "No description available"}
                          </p>
                          <div className={styles.materialListMeta}>
                            <div className={styles.materialListMetaItem}>
                              <Calendar className={styles.materialListMetaIcon} />
                              <span>{getFormattedDate(material.createdAt)}</span>
                            </div>
                            <div className={styles.materialListMetaItem}>
                              <HardDrive className={styles.materialListMetaIcon} />
                              <span>{getFileSize(material.url)}</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.materialListActions}>
                          <Badge variant="outline" className={styles.materialListBadge}>
                            {material.category}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={styles.materialListButton}
                            onClick={() => setPreviewMaterial(material)}
                          >
                            <Eye className={styles.materialListButtonIcon} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={styles.materialListButton}
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = material.url;
                              link.download = material.title;
                              link.click();
                            }}
                          >
                            <Download className={styles.materialListButtonIcon} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={styles.materialListButton}
                          >
                            <Bookmark className={styles.materialListButtonIcon} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className={styles.materialListButton}>
                                <MoreVertical className={styles.materialListButtonIcon} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setPreviewMaterial(material)}>
                                <Eye className={styles.dropdownIcon} />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className={styles.dropdownIcon} />
                                Add to Favorites
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className={styles.dropdownIcon} />
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className={styles.deleteItem}>Delete</DropdownMenuItem>
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

      {renderPreview()}
    </div>
  );
}
