'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton, SkeletonTable, SkeletonListItem } from '@/components/ui/skeleton';
import {
    Users, BookOpen, BarChart3,
    Sparkles, LogOut, Plus, CheckCircle2, AlertCircle,
    User, Pencil, Trash2, Save, X, TrendingUp, Activity, Target, KeyRound, Megaphone
} from 'lucide-react';

interface Student {
    id: string;
    username: string;
    mentorName?: string;
    isActive: boolean;
    createdAt: string;
}

interface ClassItem {
    id: string;
    title: string;
    date: string;
    sortOrder: number;
    subjectId: string;
    subject?: { name: string };
}

interface Analytics {
    dailyActivity: Array<{ date: string; classesWatched: number }>;
    subjectCompletion: Array<{ name: string; completionRate: number; totalClasses: number }>;
    topPerformers: Array<{ username: string; xp: number; level: number; percentage: number }>;
    overview: {
        totalStudents: number;
        totalClasses: number;
        avgCompletionRate: number;
        activeToday: number;
    };
}

interface Announcement {
    id: string;
    title: string;
    message: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Students
    const [students, setStudents] = useState<Student[]>([]);
    const [newStudent, setNewStudent] = useState({ username: '', password: '', mentorName: '' });
    const [editingStudent, setEditingStudent] = useState<string | null>(null);
    const [editStudentData, setEditStudentData] = useState({ username: '', password: '', mentorName: '' });
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

    // Settings
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    // Classes
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [newClass, setNewClass] = useState({ subjectName: '', title: '', date: '' });
    const [editingClass, setEditingClass] = useState<string | null>(null);
    const [editClassData, setEditClassData] = useState({ title: '', date: '' });
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

    // Analytics
    const [analytics, setAnalytics] = useState<Analytics | null>(null);

    // Announcements
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchStudents(), fetchClasses(), fetchSubjects(), fetchAnalytics(), fetchAnnouncements()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get('/users');
            setStudents(res.data);
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await api.get('/courses/classes');
            setClasses(res.data);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/courses/subjects');
            setSubjects(res.data);
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/progress/analytics');
            setAnalytics(res.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/announcements', newAnnouncement);
            showMessage('success', 'Announcement posted! 📢');
            setNewAnnouncement({ title: '', message: '' });
            fetchAnnouncements();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to post announcement');
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            showMessage('success', 'Announcement deleted');
            fetchAnnouncements();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to delete announcement');
        }
    };

    const showMessage = (type: string, text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    // Bulk selection handlers
    const toggleStudentSelection = (id: string) => {
        const newSet = new Set(selectedStudents);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedStudents(newSet);
    };

    const toggleAllStudents = () => {
        if (selectedStudents.size === students.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(students.map(s => s.id)));
        }
    };

    const toggleClassSelection = (id: string) => {
        const newSet = new Set(selectedClasses);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedClasses(newSet);
    };

    const toggleAllClasses = () => {
        if (selectedClasses.size === classes.length) {
            setSelectedClasses(new Set());
        } else {
            setSelectedClasses(new Set(classes.map(c => c.id)));
        }
    };

    // Bulk delete handlers
    const handleBulkDeleteStudents = async () => {
        if (selectedStudents.size === 0) return;
        if (!confirm(`Delete ${selectedStudents.size} students? This will delete all their progress.`)) return;

        try {
            await api.post('/users/bulk-delete', { ids: Array.from(selectedStudents) });
            showMessage('success', `Deleted ${selectedStudents.size} students! ✨`);
            setSelectedStudents(new Set());
            fetchStudents();
            fetchAnalytics();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to delete students');
        }
    };

    const handleBulkDeleteClasses = async () => {
        if (selectedClasses.size === 0) return;
        if (!confirm(`Delete ${selectedClasses.size} classes? This will delete all progress for these classes.`)) return;

        try {
            await api.post('/courses/classes/bulk-delete', { ids: Array.from(selectedClasses) });
            showMessage('success', `Deleted ${selectedClasses.size} classes! 📚`);
            setSelectedClasses(new Set());
            fetchClasses();
            fetchAnalytics();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to delete classes');
        }
    };

    // Student CRUD
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', { ...newStudent, role: 'STUDENT' });
            showMessage('success', 'Student created successfully! ✨');
            setNewStudent({ username: '', password: '', mentorName: '' });
            fetchStudents();
            fetchAnalytics();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to create student');
        }
    };

    const handleUpdateStudent = async (id: string) => {
        try {
            const updateData: any = {};
            if (editStudentData.username) updateData.username = editStudentData.username;
            if (editStudentData.password) updateData.password = editStudentData.password;
            if (editStudentData.mentorName !== undefined) updateData.mentorName = editStudentData.mentorName;

            await api.put(`/users/${id}`, updateData);
            showMessage('success', 'Student updated! ✨');
            setEditingStudent(null);
            fetchStudents();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to update student');
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm('Are you sure? This will delete all student progress.')) return;
        try {
            await api.delete(`/users/${id}`);
            showMessage('success', 'Student deleted');
            fetchStudents();
            fetchAnalytics();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to delete student');
        }
    };

    // Class CRUD
    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const subject = subjects.find(s => s.name === newClass.subjectName);
            if (!subject) throw new Error('Subject not found');

            await api.post('/courses/class', {
                title: newClass.title,
                date: newClass.date,
                subjectId: subject.id,
            });

            showMessage('success', 'Class created! 📚');
            setNewClass({ subjectName: '', title: '', date: '' });
            fetchClasses();
            fetchAnalytics();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to create class');
        }
    };

    const handleUpdateClass = async (id: string) => {
        try {
            await api.put(`/courses/class/${id}`, editClassData);
            showMessage('success', 'Class updated! ✨');
            setEditingClass(null);
            fetchClasses();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to update class');
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm('Are you sure? This will delete all progress for this class.')) return;
        try {
            await api.delete(`/courses/class/${id}`);
            showMessage('success', 'Class deleted');
            fetchClasses();
            fetchAnalytics();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to delete class');
        }
    };

    const moveClass = async (classId: string, subjectId: string, direction: 'up' | 'down') => {
        const subjectClasses = classes
            .filter(c => c.subjectId === subjectId)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        const index = subjectClasses.findIndex(c => c.id === classId);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === subjectClasses.length - 1)) {
            return;
        }

        const newOrder = [...subjectClasses];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];

        try {
            await api.post('/courses/reorder', {
                subjectId,
                classIds: newOrder.map(c => c.id),
            });
            fetchClasses();
        } catch (err) {
            console.error('Failed to reorder:', err);
        }
    };



    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('error', 'New passwords do not match');
            return;
        }
        try {
            await api.put('/users/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            showMessage('success', 'Password updated successfully! 🔒');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to update password');
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout logging failed', error);
        } finally {
            localStorage.removeItem('token');
            router.push('/');
        }
    };

    const startEditStudent = (student: Student) => {
        setEditingStudent(student.id);
        setEditStudentData({
            username: student.username,
            password: '',
            mentorName: student.mentorName || ''
        });
    };

    const startEditClass = (cls: ClassItem) => {
        setEditingClass(cls.id);
        setEditClassData({
            title: cls.title,
            date: cls.date.split('T')[0]
        });
    };

    // Group classes by subject
    const classesBySubject = classes.reduce((acc, cls) => {
        const subjectName = cls.subject?.name || 'Unknown';
        if (!acc[subjectName]) acc[subjectName] = [];
        acc[subjectName].push(cls);
        return acc;
    }, {} as Record<string, ClassItem[]>);

    // Skeleton loading
    if (loading) {
        return (
            <div className="min-h-screen gradient-bg">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                </div>
                <header className="sticky top-0 z-50 glass border-b border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-9 w-24 rounded-lg" />
                        </div>
                    </div>
                </header>
                <main className="container mx-auto px-4 py-8 relative z-10 space-y-8">
                    <Skeleton className="h-10 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 w-24 rounded-lg" />
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="glass border-white/10">
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                        <Card className="glass border-white/10">
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent>
                                <SkeletonTable rows={5} cols={3} />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-bg">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-background/50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-200">
                                IHYA Admin
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => router.push('/admin/logs')} className="gap-2 border-white/10 hover:bg-white/5">
                                <Activity className="h-4 w-4" /> <span className="hidden sm:inline">Logs</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 border-white/10 hover:bg-white/5">
                                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 relative z-10 space-y-8">
                {/* Global message */}
                {message.text && (
                    <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 text-sm p-4 rounded-xl shadow-lg ${message.type === 'success'
                        ? 'bg-green-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {message.text}
                    </div>
                )}

                <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>

                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="glass border-white/10 p-1 rounded-xl w-full grid grid-cols-2 md:grid-cols-5 h-auto">
                        <TabsTrigger value="users" className="gap-2 rounded-lg data-[state=active]:neon-glow py-2">
                            <Users className="h-4 w-4" /> <span className="hidden sm:inline">Users</span>
                        </TabsTrigger>
                        <TabsTrigger value="courses" className="gap-2 rounded-lg data-[state=active]:neon-glow py-2">
                            <BookOpen className="h-4 w-4" /> <span className="hidden sm:inline">Classes</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2 rounded-lg data-[state=active]:neon-glow py-2">
                            <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Analytics</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2 rounded-lg data-[state=active]:neon-glow py-2">
                            <KeyRound className="h-4 w-4" /> <span className="hidden sm:inline">Settings</span>
                        </TabsTrigger>
                        <TabsTrigger value="broadcasts" className="gap-2 rounded-lg data-[state=active]:neon-glow py-2 col-span-2 md:col-span-1">
                            <Megaphone className="h-4 w-4" /> <span className="hidden sm:inline">Broadcasts</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Add Student Form */}
                            <Card className="glass border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5 text-purple-400" />
                                        Add New Student
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateUser} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Username</Label>
                                            <Input
                                                value={newStudent.username}
                                                onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                                                placeholder="student123"
                                                required
                                                className="glass border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Password</Label>
                                            <Input
                                                type="password"
                                                value={newStudent.password}
                                                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                                placeholder="••••••••"
                                                required
                                                className="glass border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mentor Name</Label>
                                            <Input
                                                value={newStudent.mentorName}
                                                onChange={(e) => setNewStudent({ ...newStudent, mentorName: e.target.value })}
                                                placeholder="Usthad Name"
                                                className="glass border-white/10"
                                            />
                                        </div>
                                        <Button type="submit" className="w-full neon-glow">
                                            Create Student
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Students List */}
                            <Card className="glass border-white/10">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-purple-400" />
                                            Students ({students.length})
                                        </CardTitle>
                                        {selectedStudents.size > 0 && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={handleBulkDeleteStudents}
                                                className="gap-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete ({selectedStudents.size})
                                            </Button>
                                        )}
                                    </div>
                                    {students.length > 0 && (
                                        <div className="flex items-center gap-2 pt-2">
                                            <Checkbox
                                                checked={selectedStudents.size === students.length && students.length > 0}
                                                onCheckedChange={toggleAllStudents}
                                            />
                                            <span className="text-sm text-muted-foreground">Select All</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                        {students.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">No students yet</p>
                                        ) : (
                                            students.map((student) => (
                                                <div key={student.id} className="glass rounded-xl p-4">
                                                    {editingStudent === student.id ? (
                                                        <div className="space-y-3">
                                                            <Input
                                                                value={editStudentData.username}
                                                                onChange={(e) => setEditStudentData({ ...editStudentData, username: e.target.value })}
                                                                placeholder="Username"
                                                                className="glass border-white/10"
                                                            />
                                                            <Input
                                                                type="password"
                                                                value={editStudentData.password}
                                                                onChange={(e) => setEditStudentData({ ...editStudentData, password: e.target.value })}
                                                                placeholder="New password (leave empty to keep)"
                                                                className="glass border-white/10"
                                                            />
                                                            <Input
                                                                value={editStudentData.mentorName}
                                                                onChange={(e) => setEditStudentData({ ...editStudentData, mentorName: e.target.value })}
                                                                placeholder="Mentor Name"
                                                                className="glass border-white/10"
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button size="sm" onClick={() => handleUpdateStudent(student.id)}>
                                                                    <Save className="h-4 w-4 mr-1" /> Save
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => setEditingStudent(null)}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 md:gap-4">
                                                            <Checkbox
                                                                checked={selectedStudents.has(student.id)}
                                                                onCheckedChange={() => toggleStudentSelection(student.id)}
                                                            />
                                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                                <User className="h-5 w-5 text-purple-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold truncate">{student.username}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {student.mentorName || 'No mentor'}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button size="icon" variant="ghost" onClick={() => startEditStudent(student)}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" onClick={() => handleDeleteStudent(student.id)} className="text-red-400 hover:text-red-300">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Classes Tab */}
                    <TabsContent value="courses" className="space-y-6">
                        {/* Add Class Form */}
                        <Card className="glass border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-purple-400" />
                                    Add New Class
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateClass} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Subject</Label>
                                            <Select
                                                value={newClass.subjectName}
                                                onValueChange={(v) => setNewClass({ ...newClass, subjectName: v })}
                                            >
                                                <SelectTrigger className="glass border-white/10">
                                                    <SelectValue placeholder="Select subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="AQEEDHA">🕌 Aqeedha</SelectItem>
                                                    <SelectItem value="SELF_DEVELOPMENT">🌟 Self Development</SelectItem>
                                                    <SelectItem value="TAFSEER">📖 Tafseer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Class Title</Label>
                                            <Input
                                                value={newClass.title}
                                                onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                                                placeholder="Chapter 4: Advanced Topics"
                                                required
                                                className="glass border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Input
                                                type="date"
                                                value={newClass.date}
                                                onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                                                required
                                                className="glass border-white/10"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={!newClass.subjectName} className="neon-glow">
                                        Add Class
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Bulk Actions */}
                        {selectedClasses.size > 0 && (
                            <div className="flex items-center gap-4 p-4 glass rounded-xl">
                                <span className="text-sm">{selectedClasses.size} classes selected</span>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleBulkDeleteClasses}
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Selected
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedClasses(new Set())}
                                >
                                    Clear Selection
                                </Button>
                            </div>
                        )}

                        {/* Classes by Subject */}
                        {Object.entries(classesBySubject).map(([subjectName, subjectClasses]) => (
                            <Card key={subjectName} className="glass border-white/10">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{subjectName.replace('_', ' ')} ({subjectClasses.length} classes)</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={subjectClasses.every(c => selectedClasses.has(c.id))}
                                                onCheckedChange={() => {
                                                    const allSelected = subjectClasses.every(c => selectedClasses.has(c.id));
                                                    const newSet = new Set(selectedClasses);
                                                    subjectClasses.forEach(c => {
                                                        if (allSelected) newSet.delete(c.id);
                                                        else newSet.add(c.id);
                                                    });
                                                    setSelectedClasses(newSet);
                                                }}
                                            />
                                            <span className="text-sm text-muted-foreground">Select All</span>
                                        </div>
                                    </div>
                                    <CardDescription>Drag to reorder or use arrows</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {subjectClasses.sort((a, b) => a.sortOrder - b.sortOrder).map((cls, idx) => (
                                            <div key={cls.id} className="glass rounded-lg p-3 flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedClasses.has(cls.id)}
                                                    onCheckedChange={() => toggleClassSelection(cls.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6"
                                                        onClick={() => moveClass(cls.id, cls.subjectId, 'up')}
                                                        disabled={idx === 0}
                                                    >
                                                        ▲
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6"
                                                        onClick={() => moveClass(cls.id, cls.subjectId, 'down')}
                                                        disabled={idx === subjectClasses.length - 1}
                                                    >
                                                        ▼
                                                    </Button>
                                                </div>

                                                {/* Mobile wrapper for stacking controls if needed */}
                                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 w-full min-w-0">

                                                    {editingClass === cls.id ? (
                                                        <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:items-center">
                                                            <Input
                                                                value={editClassData.title}
                                                                onChange={(e) => setEditClassData({ ...editClassData, title: e.target.value })}
                                                                className="glass border-white/10 w-full"
                                                            />
                                                            <Input
                                                                type="date"
                                                                value={editClassData.date}
                                                                onChange={(e) => setEditClassData({ ...editClassData, date: e.target.value })}
                                                                className="glass border-white/10 w-full sm:w-40"
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button size="sm" onClick={() => handleUpdateClass(cls.id)}>
                                                                    <Save className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => setEditingClass(null)}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium truncate">{cls.title}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {new Date(cls.date).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <Button size="icon" variant="ghost" onClick={() => startEditClass(cls)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteClass(cls.id)} className="text-red-400">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        {/* Overview Stats */}
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                            <Card className="glass border-white/10">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold gradient-text">{analytics?.overview.totalStudents || 0}</div>
                                            <div className="text-sm text-muted-foreground">Total Students</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass border-white/10">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                            <BookOpen className="h-6 w-6 text-cyan-400" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold gradient-text">{analytics?.overview.totalClasses || 0}</div>
                                            <div className="text-sm text-muted-foreground">Total Classes</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass border-white/10">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                            <Target className="h-6 w-6 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold gradient-text">{analytics?.overview.avgCompletionRate || 0}%</div>
                                            <div className="text-sm text-muted-foreground">Avg Completion</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass border-white/10">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                            <Activity className="h-6 w-6 text-yellow-400" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold gradient-text">{analytics?.overview.activeToday || 0}</div>
                                            <div className="text-sm text-muted-foreground">Active Today</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Daily Activity Chart */}
                            <Card className="glass border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-purple-400" />
                                        Daily Activity (Last 7 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analytics?.dailyActivity.map((day) => {
                                            const maxVal = Math.max(...(analytics?.dailyActivity.map(d => d.classesWatched) || [1]), 1);
                                            const percentage = (day.classesWatched / maxVal) * 100;
                                            return (
                                                <div key={day.date} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className="font-semibold">{day.classesWatched} classes</span>
                                                    </div>
                                                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Subject Completion Rates */}
                            <Card className="glass border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-cyan-400" />
                                        Subject Completion Rates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics?.subjectCompletion.map((subject) => (
                                            <div key={subject.name} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{subject.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {subject.completionRate}% ({subject.totalClasses} classes)
                                                    </span>
                                                </div>
                                                <div className="h-4 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                                                        style={{ width: `${subject.completionRate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Performers */}
                        <Card className="glass border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-yellow-400" />
                                    Top Performers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                                    {analytics?.topPerformers.map((performer, index) => (
                                        <div key={performer.username} className={`glass rounded-xl p-4 text-center space-y-2 ${index === 0 ? 'neon-glow' : ''}`}>
                                            <div className={`text-3xl ${index === 0 ? '' : 'opacity-70'}`}>
                                                {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                                            </div>
                                            <div className="font-bold truncate">{performer.username}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Level {performer.level} • {performer.xp} XP
                                            </div>
                                            <div className="text-lg font-bold gradient-text">{performer.percentage}%</div>
                                        </div>
                                    ))}
                                    {(!analytics?.topPerformers || analytics.topPerformers.length === 0) && (
                                        <p className="text-muted-foreground col-span-5 text-center py-8">No performers yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card className="glass border-white/10 max-w-md mx-auto">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <KeyRound className="h-5 w-5 text-purple-400" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>Update your personal security credentials.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            className="glass border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            className="glass border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm New Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            className="glass border-white/10"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full neon-glow">
                                        Update Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {/* Announcements Tab */}
                    <TabsContent value="broadcasts" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Create Announcement */}
                            <Card className="glass border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Megaphone className="h-5 w-5 text-purple-400" />
                                        Post Announcement
                                    </CardTitle>
                                    <CardDescription>Broadcast a message to all student dashboards.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                value={newAnnouncement.title}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                                placeholder="e.g. Ramadan Mubarak!"
                                                required
                                                className="glass border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Message</Label>
                                            <Input
                                                value={newAnnouncement.message}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                                placeholder="Enter your message..."
                                                required
                                                className="glass border-white/10"
                                            />
                                        </div>
                                        <Button type="submit" className="w-full neon-glow">
                                            Post Broadcast
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Active Announcements List */}
                            <Card className="glass border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-cyan-400" />
                                        Active Broadcasts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                                        {announcements.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">No active announcements</p>
                                        ) : (
                                            announcements.map((announcement) => (
                                                <div key={announcement.id} className="glass rounded-xl p-4 space-y-2 relative group">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold">{announcement.title}</h3>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 text-red-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{announcement.message}</p>
                                                    <div className="text-xs text-white/30 pt-2 border-t border-white/5 mt-2">
                                                        Posted {new Date(announcement.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
