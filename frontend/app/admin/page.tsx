'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Users, BookOpen, BarChart,
    Sparkles, LogOut, Plus, CheckCircle2, AlertCircle,
    User, Pencil, Trash2, GripVertical, Save, X
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

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Students
    const [students, setStudents] = useState<Student[]>([]);
    const [newStudent, setNewStudent] = useState({ username: '', password: '', mentorName: '' });
    const [editingStudent, setEditingStudent] = useState<string | null>(null);
    const [editStudentData, setEditStudentData] = useState({ username: '', password: '', mentorName: '' });

    // Classes
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [newClass, setNewClass] = useState({ subjectName: '', title: '', date: '' });
    const [editingClass, setEditingClass] = useState<string | null>(null);
    const [editClassData, setEditClassData] = useState({ title: '', date: '' });
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        fetchStudents();
        fetchClasses();
        fetchSubjects();
    }, []);

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

    const showMessage = (type: string, text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    // Student CRUD
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users', { ...newStudent, role: 'STUDENT' });
            showMessage('success', 'Student created successfully! ✨');
            setNewStudent({ username: '', password: '', mentorName: '' });
            fetchStudents();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStudent = async (id: string) => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm('Are you sure? This will delete all student progress.')) return;
        setLoading(true);
        try {
            await api.delete(`/users/${id}`);
            showMessage('success', 'Student deleted');
            fetchStudents();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to delete student');
        } finally {
            setLoading(false);
        }
    };

    // Class CRUD
    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
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
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to create class');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateClass = async (id: string) => {
        setLoading(true);
        try {
            await api.put(`/courses/class/${id}`, editClassData);
            showMessage('success', 'Class updated! ✨');
            setEditingClass(null);
            fetchClasses();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to update class');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm('Are you sure? This will delete all progress for this class.')) return;
        setLoading(true);
        try {
            await api.delete(`/courses/class/${id}`);
            showMessage('success', 'Class deleted');
            fetchClasses();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Failed to delete class');
        } finally {
            setLoading(false);
        }
    };

    const moveClass = async (classId: string, subjectId: string, direction: 'up' | 'down') => {
        const subjectClasses = classes
            .filter(c => c.subjectId === subjectId)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        const index = subjectClasses.findIndex(c => c.id === classId);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === subjectClasses.length - 1)) {
            return; // Can't move
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
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

    return (
        <div className="min-h-screen gradient-bg">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-purple-400" />
                            <span className="text-xl font-bold gradient-text">IHYA Admin</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 glass">
                            <LogOut className="h-4 w-4" /> Logout
                        </Button>
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
                    <TabsList className="glass border-white/10 p-1 rounded-xl">
                        <TabsTrigger value="users" className="gap-2 rounded-lg data-[state=active]:neon-glow">
                            <Users className="h-4 w-4" /> Users
                        </TabsTrigger>
                        <TabsTrigger value="courses" className="gap-2 rounded-lg data-[state=active]:neon-glow">
                            <BookOpen className="h-4 w-4" /> Classes
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2 rounded-lg data-[state=active]:neon-glow">
                            <BarChart className="h-4 w-4" /> Stats
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
                                        <Button type="submit" disabled={loading} className="w-full neon-glow">
                                            {loading ? 'Creating...' : 'Create Student'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Students List */}
                            <Card className="glass border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-400" />
                                        Students ({students.length})
                                    </CardTitle>
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
                                                                <Button size="sm" onClick={() => handleUpdateStudent(student.id)} disabled={loading}>
                                                                    <Save className="h-4 w-4 mr-1" /> Save
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => setEditingStudent(null)}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-4">
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
                                    <Button type="submit" disabled={loading || !newClass.subjectName} className="neon-glow">
                                        {loading ? 'Creating...' : 'Add Class'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Classes by Subject */}
                        {Object.entries(classesBySubject).map(([subjectName, subjectClasses]) => (
                            <Card key={subjectName} className="glass border-white/10">
                                <CardHeader>
                                    <CardTitle>{subjectName.replace('_', ' ')} ({subjectClasses.length} classes)</CardTitle>
                                    <CardDescription>Drag to reorder or use arrows</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {subjectClasses.sort((a, b) => a.sortOrder - b.sortOrder).map((cls, idx) => (
                                            <div key={cls.id} className="glass rounded-lg p-3 flex items-center gap-3">
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

                                                {editingClass === cls.id ? (
                                                    <div className="flex-1 flex gap-2 items-center">
                                                        <Input
                                                            value={editClassData.title}
                                                            onChange={(e) => setEditClassData({ ...editClassData, title: e.target.value })}
                                                            className="glass border-white/10"
                                                        />
                                                        <Input
                                                            type="date"
                                                            value={editClassData.date}
                                                            onChange={(e) => setEditClassData({ ...editClassData, date: e.target.value })}
                                                            className="glass border-white/10 w-40"
                                                        />
                                                        <Button size="sm" onClick={() => handleUpdateClass(cls.id)}>
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingClass(null)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex-1">
                                                            <div className="font-medium">{cls.title}</div>
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
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="glass border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl font-bold gradient-text">{students.length}</div>
                                        <div className="text-muted-foreground">Total Students</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl font-bold gradient-text">{subjects.length}</div>
                                        <div className="text-muted-foreground">Active Courses</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl font-bold gradient-text">{classes.length}</div>
                                        <div className="text-muted-foreground">Total Classes</div>
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
