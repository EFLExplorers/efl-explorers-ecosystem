'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/Select";
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Key, 
  Mail, 
  Phone, 
  Upload, 
  Moon, 
  Sun, 
  Monitor
} from "lucide-react";
import { classNames } from "@/utils/classNames";
import styles from './settings.module.css';

const SETTINGS_TABS = ["profile", "security", "notifications", "appearance"] as const;

function isSettingsTab(value: string): value is (typeof SETTINGS_TABS)[number] {
  return SETTINGS_TABS.includes(value as (typeof SETTINGS_TABS)[number]);
}

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [theme, setTheme] = useState("light");
  const [colorScheme, setColorScheme] = useState("purple");

  useEffect(() => {
    if (!router.isReady) return;

    const tabQuery = Array.isArray(router.query.tab)
      ? router.query.tab[0]
      : router.query.tab;

    if (typeof tabQuery === "string" && isSettingsTab(tabQuery)) {
      setTab(tabQuery);
    }
  }, [router.isReady, router.query.tab]);
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account settings and preferences</p>
      </div>
      
      <Tabs value={tab} onValueChange={setTab} className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="profile" className={styles.tabTrigger}>
            <User className={styles.tabIcon} />
            <span className={styles.tabLabel}>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className={styles.tabTrigger}>
            <Lock className={styles.tabIcon} />
            <span className={styles.tabLabel}>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className={styles.tabTrigger}>
            <Bell className={styles.tabIcon} />
            <span className={styles.tabLabel}>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className={styles.tabTrigger}>
            <Palette className={styles.tabIcon} />
            <span className={styles.tabLabel}>Appearance</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile" className={styles.tabsContent}>
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Personal Information</h2>
            </CardHeader>
            
            <CardContent className={styles.cardContent}>
              <div className={styles.profileSection}>
                <div className={styles.avatarSection}>
                  <Avatar className={styles.avatar}>
                    <AvatarFallback className={styles.avatarFallback}>JD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className={styles.avatarButton}>
                    <Upload className={styles.avatarButtonIcon} />
                    Change Photo
                  </Button>
                </div>
                
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@teachpro.edu" />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue="Science Teacher" readOnly className={styles.readOnlyInput} />
                  </div>
                </div>
              </div>
              
              <Separator className={styles.separator} />
              
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" type="email" defaultValue="john.personal@example.com" />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
                </div>
                <div className={classNames(styles.formField, styles.formFieldFull)}>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" rows={3} defaultValue="123 Education Street, Teaching City, TC 12345" />
                </div>
              </div>
              
              <Separator className={styles.separator} />
              
              <div className={styles.formField}>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea 
                  id="bio" 
                  rows={4} 
                  placeholder="Tell us about your teaching experience, specializations, and interests..."
                  defaultValue="Science teacher with 10+ years of experience specializing in chemistry and biology. Passionate about hands-on learning and incorporating technology into science education."
                />
              </div>
              
              <div className={styles.formActions}>
                <Button className={styles.saveButton}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Teaching Preferences</h2>
            </CardHeader>
            
            <CardContent className={styles.cardContent}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <Label htmlFor="subject">Primary Subject</Label>
                  <Select defaultValue="science">
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="grade">Grade Level</Label>
                  <Select defaultValue="middle">
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elementary">Elementary School</SelectItem>
                      <SelectItem value="middle">Middle School</SelectItem>
                      <SelectItem value="high">High School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="classroom">Preferred Classroom</Label>
                  <Select defaultValue="102">
                    <SelectTrigger id="classroom">
                      <SelectValue placeholder="Select classroom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="102">Room 102 (Science Lab)</SelectItem>
                      <SelectItem value="205">Room 205</SelectItem>
                      <SelectItem value="118">Room 118</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="schedule">Preferred Schedule</Label>
                  <Select defaultValue="morning">
                    <SelectTrigger id="schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM-4PM)</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <Button className={styles.saveButton}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security" className={styles.tabsContent}>
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Change Password</h2>
            </CardHeader>
            
            <CardContent className={styles.cardContent}>
              <div className={styles.formFields}>
                <div className={styles.formField}>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                  <p className={styles.helpText}>
                    Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
                  </p>
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              
              <div className={styles.formActions}>
                <Button className={styles.saveButton}>Update Password</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Two-Factor Authentication</h2>
            </CardHeader>
            
            <CardContent className={styles.cardContent}>
              <div className={styles.switchSection}>
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitle}>Two-Factor Authentication</div>
                    <div className={styles.switchDescription}>
                      Add an extra layer of security to your account by requiring a verification code.
                    </div>
                  </div>
                  <Switch id="twoFactorAuth" />
                </div>
              </div>
              
              <Separator className={styles.separator} />
              
              <div className={styles.switchSection}>
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitleWithIcon}>
                      <Mail className={styles.switchIcon} />
                      <span>Email Authentication</span>
                    </div>
                    <div className={styles.switchDescription}>
                      Receive verification codes via email.
                    </div>
                  </div>
                  <Switch id="emailAuth" defaultChecked />
                </div>
                
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitleWithIcon}>
                      <Phone className={styles.switchIcon} />
                      <span>SMS Authentication</span>
                    </div>
                    <div className={styles.switchDescription}>
                      Receive verification codes via text message.
                    </div>
                  </div>
                  <Switch id="smsAuth" />
                </div>
                
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitleWithIcon}>
                      <Key className={styles.switchIcon} />
                      <span>Authenticator App</span>
                    </div>
                    <div className={styles.switchDescription}>
                      Use an authenticator app for verification codes.
                    </div>
                  </div>
                  <Switch id="appAuth" />
                </div>
              </div>
              
              <div className={styles.formActions}>
                <Button className={styles.saveButton}>Save Security Settings</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Session Management</h2>
            </CardHeader>
            
            <CardContent className={styles.cardContent}>
              <div className={styles.sessionsList}>
                <div className={styles.sessionItem}>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionTitle}>Current Session</div>
                    <div className={styles.sessionDescription}>
                      Chrome on macOS • New York, USA • Active Now
                    </div>
                  </div>
                  <span className={styles.sessionBadge}>Current</span>
                </div>
                
                <div className={styles.sessionItem}>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionTitle}>Safari on iPad</div>
                    <div className={styles.sessionDescription}>
                      Chicago, USA • Last active 2 days ago
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className={styles.signOutButton}>
                    Sign Out
                  </Button>
                </div>
                
                <div className={styles.sessionItem}>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionTitle}>Edge on Windows</div>
                    <div className={styles.sessionDescription}>
                      Boston, USA • Last active 5 days ago
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className={styles.signOutButton}>
                    Sign Out
                  </Button>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <Button variant="destructive">Sign Out All Devices</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications" className={styles.tabsContent}>
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Email Notifications</h2>
            </CardHeader>
            
            <CardContent className={styles.cardContent}>
              <div className={styles.switchSection}>
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitle}>Messages</div>
                    <div className={styles.switchDescription}>
                      Receive email notifications when you get a new message.
                    </div>
                  </div>
                  <Switch id="emailMessages" defaultChecked />
                </div>
                
                <Separator className={styles.separator} />
                
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitle}>Student Updates</div>
                    <div className={styles.switchDescription}>
                      Notifications about student activity and performance.
                    </div>
                  </div>
                  <Switch id="emailStudentUpdates" defaultChecked />
                </div>
                
                <Separator className={styles.separator} />
                
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitle}>Announcements</div>
                    <div className={styles.switchDescription}>
                      School-wide and department announcements.
                    </div>
                  </div>
                  <Switch id="emailAnnouncements" defaultChecked />
                </div>
                
                <Separator className={styles.separator} />
                
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitle}>Calendar Events</div>
                    <div className={styles.switchDescription}>
                      Reminders for upcoming classes and events.
                    </div>
                  </div>
                  <Switch id="emailCalendarEvents" />
                </div>
                
                <Separator className={styles.separator} />
                
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitle}>System Updates</div>
                    <div className={styles.switchDescription}>
                      Information about platform changes and updates.
                    </div>
                  </div>
                  <Switch id="emailSystemUpdates" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>In-App Notifications</h2>
            </CardHeader>
            
            <CardContent className={styles.cardContent}>
              <div className={styles.switchSection}>
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitle}>Messages and Mentions</div>
                    <div className={styles.switchDescription}>
                      Get notified when someone messages or mentions you.
                    </div>
                  </div>
                  <Switch id="inAppMessages" defaultChecked />
                </div>
                
                <Separator className={styles.separator} />
                
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitle}>Assignment Submissions</div>
                    <div className={styles.switchDescription}>
                      Notifications when students submit assignments.
                    </div>
                  </div>
                  <Switch id="inAppSubmissions" defaultChecked />
                </div>
                
                <Separator className={styles.separator} />
                
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <div className={styles.switchTitle}>Reminders</div>
                    <div className={styles.switchDescription}>
                      Reminders for upcoming deadlines and events.
                    </div>
                  </div>
                  <Switch id="inAppReminders" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance" className={styles.tabsContent}>
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Theme</h2>
            </CardHeader>
            
            <CardContent className={styles.cardContent}>
              <div className={styles.themeOptions}>
                <button 
                  className={classNames(styles.themeOption, theme === "light" && styles.themeOptionActive)}
                  onClick={() => setTheme("light")}
                >
                  <Sun className={styles.themeIcon} />
                  <span>Light</span>
                </button>
                <button 
                  className={classNames(styles.themeOption, theme === "dark" && styles.themeOptionActive)}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className={styles.themeIcon} />
                  <span>Dark</span>
                </button>
                <button 
                  className={classNames(styles.themeOption, theme === "system" && styles.themeOptionActive)}
                  onClick={() => setTheme("system")}
                >
                  <Monitor className={styles.themeIcon} />
                  <span>System</span>
                </button>
              </div>
            </CardContent>
          </Card>
          
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Color Scheme</h2>
            </CardHeader>
            
            <CardContent className={styles.cardContent}>
              <div className={styles.colorOptions}>
                {["purple", "blue", "green", "orange"].map((color) => (
                  <button
                    key={color}
                    className={classNames(
                      styles.colorOption,
                      colorScheme === color && styles.colorOptionActive
                    )}
                    onClick={() => setColorScheme(color)}
                  >
                    <div className={classNames(styles.colorSwatch, styles[`colorSwatch${color.charAt(0).toUpperCase() + color.slice(1)}`])}></div>
                    <span className={styles.colorLabel}>{color.charAt(0).toUpperCase() + color.slice(1)}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
