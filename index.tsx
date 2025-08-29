
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPE DEFINITIONS ---
interface User {
  id: number;
  name: string;
  role: 'teacher' | 'student';
}

interface Homework {
  id: number;
  teacherId: number;
  subject: string;
  details: string;
  dueDate: string;
  createdAt: string;
  attachment?: string;
}

interface ReadStatus {
  homeworkId: number;
  studentId: number;
  read: boolean;
}

type SubmissionStatus = 'Submitted' | 'Approved' | 'Needs Revision';

interface Submission {
    homeworkId: number;
    studentId: number;
    submissionType: 'file' | 'link';
    content: { name: string; url: string } | string;
    submittedAt: string;
    status: SubmissionStatus;
    teacherComment?: string;
}

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: 1, name: 'ครูแอนนา', role: 'teacher' },
  { id: 2, name: 'นักเรียนบ๊อบ', role: 'student' },
  { id: 3, name: 'นักเรียนชาร์ลี', role: 'student' },
  { id: 4, name: 'นักเรียนไดอาน่า', role: 'student' },
];

const MOCK_HOMEWORK: Homework[] = [
  { id: 101, teacherId: 1, subject: 'คณิตศาสตร์', details: 'ทำแบบฝึกหัด 1-10 ในหน้า 52 ของหนังสือเรียน', dueDate: '2024-08-15', createdAt: '2024-08-01', attachment: 'worksheet.pdf' },
  { id: 102, teacherId: 1, subject: 'ประวัติศาสตร์', details: 'เขียนเรียงความ 500 คำเกี่ยวกับการปฏิวัติอุตสาหกรรม', dueDate: '2024-08-20', createdAt: '2024-08-05' },
  { id: 103, teacherId: 1, subject: 'วิทยาศาสตร์', details: 'วาดแผนภาพวัฏจักรของน้ำและติดฉลากทุกส่วน', dueDate: '2024-08-25', createdAt: '2024-08-10' },
];

const MOCK_READ_STATUS: ReadStatus[] = [
  { homeworkId: 101, studentId: 2, read: true },
  { homeworkId: 101, studentId: 3, read: true },
  { homeworkId: 101, studentId: 4, read: false },
  { homeworkId: 102, studentId: 2, read: true },
  { homeworkId: 102, studentId: 3, read: false },
  { homeworkId: 102, studentId: 4, read: false },
  { homeworkId: 103, studentId: 2, read: false },
  { homeworkId: 103, studentId: 3, read: false },
  { homeworkId: 103, studentId: 4, read: false },
];

const MOCK_SUBMISSIONS: Submission[] = [
    { homeworkId: 101, studentId: 2, submissionType: 'file', content: { name: 'math_ex_1-10.pdf', url: '#' }, submittedAt: '2024-08-14T10:00:00Z', status: 'Approved' },
    { homeworkId: 101, studentId: 3, submissionType: 'link', content: 'https://docs.google.com/document/d/example', submittedAt: '2024-08-15T09:00:00Z', status: 'Needs Revision', teacherComment: 'กรุณาตรวจสอบการคำนวณสำหรับคำถามข้อที่ 5 และเพิ่มคำอธิบายอย่างละเอียดสำหรับสองคำถามสุดท้าย' },
];


// --- HELPERS ---
const translateStatus = (status: SubmissionStatus | 'Read' | 'New' | 'Not Submitted'): string => {
    switch (status) {
        case 'Approved': return 'ผ่าน';
        case 'Needs Revision': return 'ต้องแก้ไข';
        case 'Submitted': return 'ส่งแล้ว';
        case 'Read': return 'อ่านแล้ว';
        case 'New': return 'ใหม่';
        case 'Not Submitted': return 'ยังไม่ส่ง';
        default: return status;
    }
};

// --- APP COMPONENTS ---

const WorkflowDiagram = () => {
  return (
    <div className="workflow-diagram">
      <h2>ขั้นตอนการทำงาน – ระบบโพสต์และส่งการบ้าน</h2>
      <div className="workflow-steps">
        <div className="workflow-step">
          <div className="workflow-icon"><i className="fas fa-user-edit"></i></div>
          <p><strong>1. สร้างโพสต์การบ้าน</strong></p>
          <span>ครู/หัวหน้าห้องโพสต์การบ้าน (วิชา, รายละเอียด, วันส่ง)</span>
        </div>
        <div className="workflow-arrow"><i className="fas fa-long-arrow-alt-right"></i></div>
        <div className="workflow-step">
          <div className="workflow-icon"><i className="fas fa-bell"></i></div>
          <p><strong>2. ส่ง Push Notification</strong></p>
          <span>ระบบแจ้งเตือนนักเรียนทุกคนอัตโนมัติ</span>
        </div>
        <div className="workflow-arrow"><i className="fas fa-long-arrow-alt-right"></i></div>
        <div className="workflow-step">
          <div className="workflow-icon"><i className="fas fa-upload"></i></div>
          <p><strong>3. นักเรียนส่งการบ้าน</strong></p>
          <span>อัปโหลดไฟล์/ลิงก์ พร้อมบันทึกเวลาส่ง</span>
        </div>
        <div className="workflow-arrow"><i className="fas fa-long-arrow-alt-right"></i></div>
        <div className="workflow-step">
          <div className="workflow-icon"><i className="fas fa-check-double"></i></div>
          <p><strong>4. ครูตรวจการบ้าน</strong></p>
          <span>ให้สถานะ (ผ่าน/แก้ไข) และใส่คอมเมนต์</span>
        </div>
         <div className="workflow-arrow"><i className="fas fa-long-arrow-alt-right"></i></div>
        <div className="workflow-step">
          <div className="workflow-icon"><i className="fas fa-chart-pie"></i></div>
          <p><strong>5. แดชบอร์ด</strong></p>
          <span>ครูและนักเรียนดูสรุปผล</span>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState(MOCK_USERS[0].id.toString());

  const handleLogin = () => {
    const user = MOCK_USERS.find(u => u.id === parseInt(selectedUserId));
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="login-screen">
        <div className="login-container">
            <div className="login-card">
                <h1><i className="fas fa-book-reader"></i> Homework Hub</h1>
                <p>กรุณาเลือกบัญชีของคุณเพื่อเข้าสู่ระบบ</p>
                <div className="form-group">
                <label htmlFor="user-select">บัญชีผู้ใช้</label>
                <select id="user-select" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    {MOCK_USERS.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name} ({user.role === 'teacher' ? 'ครู' : 'นักเรียน'})
                    </option>
                    ))}
                </select>
                </div>
                <button onClick={handleLogin} className="btn btn-primary">เข้าสู่ระบบ</button>
            </div>
            <WorkflowDiagram />
        </div>
    </div>
  );
};

const HomeworkModal = ({ homework, onClose, onSave, isCreating, currentUser, submission, onHomeworkSubmit, onMarkAsRead }) => {
    const [subject, setSubject] = useState(homework?.subject || '');
    const [dueDate, setDueDate] = useState(homework?.dueDate || '');
    const [details, setDetails] = useState(homework?.details || '');
    const [submissionType, setSubmissionType] = useState<'file' | 'link'>('file');
    const [file, setFile] = useState<File | null>(null);
    const [link, setLink] = useState('');
    
    useEffect(() => {
        if (currentUser.role === 'student' && onMarkAsRead && homework?.id) {
            onMarkAsRead(homework.id);
        }
    }, [homework?.id, currentUser.role, onMarkAsRead]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave({ ...homework, subject, dueDate, details });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = submissionType === 'file'
            ? { type: 'file', content: file }
            : { type: 'link', content: link };
        
        if (submissionData.content) {
            onHomeworkSubmit(homework.id, submissionData);
        }
    };
    
    const renderSubmissionContent = () => {
        if (!submission || !submission.content) {
            return null;
        }

        const { content } = submission;

        // Check for link (string)
        if (typeof content === 'string' && content.length > 0) {
            return <p><a href={content} target="_blank" rel="noopener noreferrer" className="file-link"><i className="fas fa-link"></i> {content}</a></p>;
        }
        
        // Check for file object {name: string, url: string}
        if (typeof content === 'object' && content !== null && 
            'name' in content && typeof (content as any).name === 'string' && 
            'url' in content && typeof (content as any).url === 'string') {
            const fileContent = content as { name: string, url: string };
            return <p><a href={fileContent.url} className="file-link"><i className="fas fa-file-alt"></i> {fileContent.name}</a></p>;
        }

        console.warn("Unexpected submission content format:", content);
        return null; // Fallback for any other case
    };


    const showSubmissionForm = !submission || submission.status === 'Needs Revision';

    // Student view
    if (currentUser.role === 'student') {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>รายละเอียดการบ้าน</h2>
                        <button onClick={onClose} className="close-button">&times;</button>
                    </div>
                    <div className="homework-detail-body">
                         <div className="detail-item"><strong>วิชา</strong><p>{homework.subject}</p></div>
                         <div className="detail-item"><strong>กำหนดส่ง</strong><p>{new Date(homework.dueDate).toLocaleDateString('th-TH')}</p></div>
                         <div className="detail-item"><strong>รายละเอียด</strong><p>{homework.details}</p></div>
                        {homework.attachment && (
                            <div className="detail-item">
                                <strong>ไฟล์แนบจากครู</strong>
                                <p><a href="#" className="file-link"><i className="fas fa-paperclip"></i> {homework.attachment}</a></p>
                            </div>
                        )}
                    </div>
                    <div className="submission-section">
                        <h3>งานที่คุณส่ง</h3>
                        {submission && (
                             <div className={`submission-status-banner status-${submission.status.toLowerCase().replace(' ', '-')}`}>
                                <i className={`fas ${submission.status === 'Approved' ? 'fa-check-circle' : (submission.status === 'Needs Revision' ? 'fa-exclamation-circle' : 'fa-clock')}`}></i>
                                <div>
                                    <strong>สถานะ: {translateStatus(submission.status)}</strong>
                                    <span>ส่งเมื่อ {new Date(submission.submittedAt).toLocaleDateString('th-TH')}</span>
                                    {renderSubmissionContent()}
                                </div>
                            </div>
                        )}
                        
                        {submission?.status === 'Needs Revision' && submission.teacherComment && (
                            <div className="teacher-comment-box">
                                <h4><i className="fas fa-comment-dots"></i> ความคิดเห็นจากครู</h4>
                                <p>{submission.teacherComment}</p>
                            </div>
                        )}

                        {showSubmissionForm && (
                            <form onSubmit={handleSubmit} className="submission-form">
                                {submission?.status === 'Needs Revision' && <p className="revision-notice">ครูขอให้แก้ไขงาน กรุณาส่งงานของคุณอีกครั้ง</p>}
                                <div className="submission-type-toggle">
                                    <button type="button" className={submissionType === 'file' ? 'active' : ''} onClick={() => setSubmissionType('file')}>
                                        <i className="fas fa-file-upload"></i> อัปโหลดไฟล์
                                    </button>
                                    <button type="button" className={submissionType === 'link' ? 'active' : ''} onClick={() => setSubmissionType('link')}>
                                        <i className="fas fa-link"></i> ส่งลิงก์
                                    </button>
                                </div>
                                {submissionType === 'file' ? (
                                    <div className="form-group">
                                        <label htmlFor="file-upload">อัปโหลดงานของคุณ</label>
                                        <input type="file" id="file-upload" onChange={handleFileChange} required />
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label htmlFor="link-input">วางลิงก์ที่นี่</label>
                                        <input type="url" id="link-input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://example.com/homework" required />
                                    </div>
                                )}
                                <button type="submit" className="btn btn-primary" disabled={(submissionType === 'file' && !file) || (submissionType === 'link' && !link)}>
                                    <i className="fas fa-upload"></i> {submission ? 'ส่งอีกครั้ง' : 'ส่งการบ้าน'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Teacher view (Create/Edit)
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <div className="modal-header">
                        <h2>{isCreating ? 'สร้างการบ้าน' : 'แก้ไขการบ้าน'}</h2>
                        <button type="button" onClick={onClose} className="close-button">&times;</button>
                    </div>
                    <div className="form-group"><label htmlFor="subject">วิชา</label><input id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="dueDate">กำหนดส่ง</label><input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="details">รายละเอียด</label><textarea id="details" value={details} onChange={e => setDetails(e.target.value)} required></textarea></div>
                    <div className="form-group"><label>ไฟล์แนบ (ถ้ามี)</label><div className="file-input-wrapper"><i className="fas fa-upload"></i> คลิกเพื่ออัปโหลดไฟล์</div></div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-danger">ยกเลิก</button>
                        <button type="submit" className="btn btn-primary">บันทึกการบ้าน</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SubmissionsModal = ({ homework, submissions, students, readStatuses, onClose, onUpdateStatus, onTeacherSubmit }) => {
    const [revisionState, setRevisionState] = useState<{ submissionId: string | null; comment: string }>({ submissionId: null, comment: '' });

    const studentSubmissions = students.map(student => {
        const submission = submissions.find(s => s.studentId === student.id && s.homeworkId === homework.id);
        const hasRead = readStatuses.find(rs => rs.studentId === student.id && rs.homeworkId === homework.id)?.read || false;
        return { student, submission, hasRead };
    });
    
    const submittedCount = studentSubmissions.filter(s => s.submission).length;
    const totalStudents = students.length;

    const handleRevisionClick = (submission: Submission) => {
        setRevisionState({ submissionId: `${submission.homeworkId}-${submission.studentId}`, comment: '' });
    };
    
    const handleConfirmRevision = (submission: Submission) => {
        onUpdateStatus(submission, 'Needs Revision', revisionState.comment);
        setRevisionState({ submissionId: null, comment: '' });
    };

    const renderSubmissionContent = (submission) => {
        if (!submission || !submission.content) {
            return null;
        }

        const { content } = submission;

        // Check for link (string)
        if (typeof content === 'string' && content.length > 0) {
            return <a href={content} target="_blank" rel="noopener noreferrer" className="file-link"><i className="fas fa-link"></i> ลิงก์</a>;
        }

        // Check for file object {name: string, url: string}
        if (typeof content === 'object' && content !== null && 
            'name' in content && typeof (content as any).name === 'string' &&
            'url' in content && typeof (content as any).url === 'string') {
            const fileContent = content as { name: string, url: string };
            return <a href={fileContent.url} className="file-link" target="_blank" rel="noopener noreferrer"><i className="fas fa-file-alt"></i> {fileContent.name}</a>;
        }
        
        console.warn("Unexpected submission content format:", content);
        return null; // Fallback for any other case
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>รายการส่งงาน: {homework.subject}</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <p>นักเรียน <strong>{submittedCount} จาก {totalStudents}</strong> คน ส่งการบ้านนี้แล้ว</p>
                <ul className="submission-list">
                    {studentSubmissions.map(({ student, submission, hasRead }) => (
                        <li key={student.id} className="submission-item">
                            <span className="student-name">{student.name}</span>
                            <div className="submission-details">
                                <span className={`read-status ${hasRead ? 'read' : 'unread'}`} title={hasRead ? 'อ่านแล้ว' : 'ยังไม่อ่าน'}>
                                    <i className={`fas ${hasRead ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                </span>
                                {submission ? (
                                    <>
                                        {renderSubmissionContent(submission)}
                                        <span className="timestamp">
                                            <i className="fas fa-clock"></i> {new Date(submission.submittedAt).toLocaleString('th-TH')}
                                        </span>
                                        <span className={`status ${submission.status.toLowerCase().replace(' ', '-')}`}>
                                            <i className={`fas ${submission.status === 'Approved' ? 'fa-check-circle' : (submission.status === 'Needs Revision' ? 'fa-exclamation-circle' : 'fa-hourglass-half')}`}></i> {translateStatus(submission.status)}
                                        </span>
                                        {submission.status !== 'Approved' && (
                                            <div className="grading-actions">
                                                <button onClick={() => onUpdateStatus(submission, 'Approved')} className="btn btn-grade approve" title="ผ่าน">
                                                    <i className="fas fa-check"></i>
                                                </button>
                                                <button onClick={() => handleRevisionClick(submission)} className="btn btn-grade revision" title="แก้ไข">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <span className="status not-submitted">
                                            <i className="fas fa-times-circle"></i> {translateStatus('Not Submitted')}
                                        </span>
                                        <button onClick={() => onTeacherSubmit(homework.id, student.id)} className="btn btn-grade submit-for-student">
                                            <i className="fas fa-upload"></i> ส่งงานแทนนักเรียน
                                        </button>
                                    </>
                                )}
                            </div>
                            {revisionState.submissionId === `${submission?.homeworkId}-${submission?.studentId}` && (
                                <div className="revision-comment-form">
                                    <textarea 
                                        placeholder="เพิ่มความคิดเห็นสำหรับนักเรียน..." 
                                        value={revisionState.comment}
                                        onChange={(e) => setRevisionState({...revisionState, comment: e.target.value})}
                                    />
                                    <div className="revision-form-actions">
                                        <button onClick={() => setRevisionState({ submissionId: null, comment: '' })} className="btn btn-secondary">ยกเลิก</button>
                                        <button onClick={() => handleConfirmRevision(submission)} className="btn btn-primary" disabled={!revisionState.comment.trim()}>ยืนยันการแก้ไข</button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


const HomeworkCard = ({ homework, onClick, userRole, studentInfo, read }) => {
    const { submission, stats } = studentInfo;
    
    let cardClass = 'homework-card';
    let statusKey: SubmissionStatus | 'Read' | 'New' = 'New';
    if (userRole === 'student') {
        if (submission?.status === 'Approved') {
            cardClass += ' approved';
            statusKey = 'Approved';
        } else if (submission?.status === 'Needs Revision') {
            cardClass += ' needs-revision';
            statusKey = 'Needs Revision';
        } else if (submission) {
            cardClass += ' submitted';
            statusKey = 'Submitted';
        } else if (read) {
            cardClass += ' read';
            statusKey = 'Read';
        } else {
            cardClass += ' new';
            statusKey = 'New';
        }
    }
    const statusTag = userRole === 'student' ? <span className={`status-tag status-${statusKey.toLowerCase().replace(' ', '-')}`}>{translateStatus(statusKey)}</span> : null;


    return (
        <div className={cardClass} onClick={onClick}>
            <div className="card-header">
                <h3>{homework.subject}</h3>
                {statusTag}
            </div>
            <div className="card-body">
                <p>{homework.details.substring(0, 100)}{homework.details.length > 100 ? '...' : ''}</p>
                {userRole === 'teacher' && stats && (
                    <div className="teacher-stats">
                        <div className="stat-item">
                            <span className="stat-value">{stats.readPercentage.toFixed(0)}%</span>
                            <span className="stat-label">อ่านแล้ว</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.submissionPercentage.toFixed(0)}%</span>
                            <span className="stat-label">ส่งแล้ว</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.gradedPercentage.toFixed(0)}%</span>
                            <span className="stat-label">ตรวจแล้ว</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="card-footer">
                <i className="fas fa-calendar-alt"></i> กำหนดส่ง: {new Date(homework.dueDate).toLocaleDateString('th-TH')}
            </div>
        </div>
    );
};

const StudentSubmissionsDashboard = ({ students, homework, submissions }) => {
    const homeworkBySubject = useMemo(() => {
        return homework.reduce((acc, hw) => {
            if (!acc[hw.subject]) {
                acc[hw.subject] = [];
            }
            acc[hw.subject].push(hw);
            return acc;
        }, {});
    }, [homework]);

    return (
        <div className="student-submissions-dashboard">
            {students.map(student => (
                <div key={student.id} className="student-card">
                    <h3><i className="fas fa-user-graduate"></i> {student.name}</h3>
                    {Object.keys(homeworkBySubject).map(subject => (
                        <div key={subject} className="subject-group">
                            <h4>{subject}</h4>
                            <ul>
                                {homeworkBySubject[subject].map(hw => {
                                    const submission = submissions.find(s => s.studentId === student.id && s.homeworkId === hw.id);
                                    let status: SubmissionStatus | 'Not Submitted' = 'Not Submitted';
                                    let statusClass = 'not-submitted';
                                    if (submission) {
                                        status = submission.status;
                                        statusClass = submission.status.toLowerCase().replace(' ', '-');
                                    }
                                    return (
                                        <li key={hw.id} className="homework-submission-item">
                                            <span>{hw.details.substring(0, 40)}...</span>
                                            <span className={`status ${statusClass}`}>{translateStatus(status)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

const TeacherSubmitModal = ({ student, homework, onClose, onSubmit }) => {
    const [submissionType, setSubmissionType] = useState<'file' | 'link'>('file');
    const [file, setFile] = useState<File | null>(null);
    const [link, setLink] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = submissionType === 'file'
            ? { type: 'file', content: file }
            : { type: 'link', content: link };

        if (submissionData.content) {
            onSubmit(submissionData);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>ส่งงานแทน {student.name}</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                 <div className="homework-detail-body" style={{paddingBottom: '15px'}}>
                     <div className="detail-item"><strong>วิชา</strong><p>{homework.subject}</p></div>
                 </div>
                <form onSubmit={handleSubmit} className="submission-form">
                    <div className="submission-type-toggle">
                        <button type="button" className={submissionType === 'file' ? 'active' : ''} onClick={() => setSubmissionType('file')}>
                            <i className="fas fa-file-upload"></i> อัปโหลดไฟล์
                        </button>
                        <button type="button" className={submissionType === 'link' ? 'active' : ''} onClick={() => setSubmissionType('link')}>
                            <i className="fas fa-link"></i> ส่งลิงก์
                        </button>
                    </div>
                    {submissionType === 'file' ? (
                        <div className="form-group">
                            <label htmlFor="file-upload">อัปโหลดงานของนักเรียน</label>
                            <input type="file" id="file-upload" onChange={handleFileChange} required />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label htmlFor="link-input">วางลิงก์ที่นี่</label>
                            <input type="url" id="link-input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://example.com/homework" required />
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={(submissionType === 'file' && !file) || (submissionType === 'link' && !link)}>
                        <i className="fas fa-upload"></i> ส่งการบ้าน
                    </button>
                </form>
            </div>
        </div>
    );
};


const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [homework, setHomework] = useState<Homework[]>(MOCK_HOMEWORK);
  const [readStatuses, setReadStatuses] = useState<ReadStatus[]>(MOCK_READ_STATUS);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'studentView' | 'submissions' | null>(null);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [teacherView, setTeacherView] = useState<'assignments' | 'students'>('assignments');
  const [studentFilter, setStudentFilter] = useState<'all' | 'pending' | 'submitted' | 'checked'>('all');
  
  const [isTeacherSubmitModalOpen, setTeacherSubmitModalOpen] = useState(false);
  const [submissionTarget, setSubmissionTarget] = useState<{ homeworkId: number; studentId: number } | null>(null);

  const students = useMemo(() => MOCK_USERS.filter(u => u.role === 'student'), []);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);
  const handleCloseModals = () => {
      setModalOpen(false);
      setSelectedHomework(null);
      setModalType(null);
  };
  
  const handleOpenModal = (type: 'create' | 'studentView' | 'submissions', hw: Homework | null) => {
      setModalType(type);
      setSelectedHomework(hw);
      setModalOpen(true);
  };

  const handleSaveHomework = (hwData: Homework) => {
    if (hwData.id) { // Edit
      setHomework(homework.map(h => h.id === hwData.id ? { ...h, ...hwData } : h));
    } else { // Create
      const newHomework: Homework = {
        ...hwData, id: Date.now(), teacherId: currentUser!.id, createdAt: new Date().toISOString(),
      };
      setHomework([newHomework, ...homework]);
      const newStatuses = students.map(s => ({ homeworkId: newHomework.id, studentId: s.id, read: false }));
      setReadStatuses([...readStatuses, ...newStatuses]);
    }
    handleCloseModals();
  };

  const handleHomeworkSubmit = (homeworkId: number, submissionData: { type: 'file' | 'link', content: File | string }) => {
      const existingSubmissionIndex = submissions.findIndex(s => s.homeworkId === homeworkId && s.studentId === currentUser!.id);
      
      const newSubmission: Submission = {
          homeworkId,
          studentId: currentUser!.id,
          submissionType: submissionData.type,
          content: submissionData.type === 'file' 
                   ? { name: (submissionData.content as File).name, url: '#' } 
                   : submissionData.content as string,
          submittedAt: new Date().toISOString(),
          status: 'Submitted',
      };

      if (existingSubmissionIndex > -1) {
          const updatedSubmissions = [...submissions];
          updatedSubmissions[existingSubmissionIndex] = newSubmission;
          setSubmissions(updatedSubmissions);
      } else {
          setSubmissions([...submissions, newSubmission]);
      }
      
      handleMarkAsRead(homeworkId);
      handleCloseModals();
  };
  
  const handleTeacherSubmitForStudent = (homeworkId: number, studentId: number) => {
      setSubmissionTarget({ homeworkId, studentId });
      setTeacherSubmitModalOpen(true);
  };

  const handleConfirmTeacherSubmit = (submissionData: { type: 'file' | 'link', content: File | string }) => {
    if (!submissionTarget) return;
    const { homeworkId, studentId } = submissionTarget;

    const newSubmission: Submission = {
        homeworkId,
        studentId,
        submissionType: submissionData.type,
        content: submissionData.type === 'file'
                 ? { name: (submissionData.content as File).name, url: '#' }
                 : submissionData.content as string,
        submittedAt: new Date().toISOString(),
        status: 'Submitted',
    };

    const existingSubmissionIndex = submissions.findIndex(s => s.homeworkId === homeworkId && s.studentId === studentId);

    if (existingSubmissionIndex > -1) {
        const updatedSubmissions = [...submissions];
        updatedSubmissions[existingSubmissionIndex] = newSubmission;
        setSubmissions(updatedSubmissions);
    } else {
        setSubmissions([...submissions, newSubmission]);
    }

    setTeacherSubmitModalOpen(false);
    setSubmissionTarget(null);
  };

  const handleUpdateSubmissionStatus = (submission: Submission, status: SubmissionStatus, comment?: string) => {
      setSubmissions(submissions.map(s => 
          s.homeworkId === submission.homeworkId && s.studentId === submission.studentId
          ? { ...s, status, teacherComment: comment || s.teacherComment }
          : s
      ));
  };
  
  const handleMarkAsRead = (homeworkId: number) => {
      const hasRead = readStatuses.some(rs => rs.homeworkId === homeworkId && rs.studentId === currentUser!.id && rs.read);
      if (!hasRead) {
          setReadStatuses(prev => {
              const updated = prev.filter(rs => !(rs.homeworkId === homeworkId && rs.studentId === currentUser!.id));
              updated.push({ homeworkId, studentId: currentUser!.id, read: true });
              return updated;
          });
      }
  };

  const getStatsForHomework = (homeworkId: number) => {
    if (students.length === 0) return { readPercentage: 0, submissionPercentage: 0, gradedPercentage: 0 };
    
    const relevantReads = readStatuses.filter(rs => rs.homeworkId === homeworkId && rs.read).length;
    const relevantSubmissions = submissions.filter(s => s.homeworkId === homeworkId);
    const gradedSubmissions = relevantSubmissions.filter(s => s.status === 'Approved').length;
    
    return {
        readPercentage: (relevantReads / students.length) * 100,
        submissionPercentage: (relevantSubmissions.length / students.length) * 100,
        gradedPercentage: (relevantSubmissions.length > 0) ? (gradedSubmissions / relevantSubmissions.length) * 100 : 0,
    };
  };
  
  const teacherHomework = useMemo(() => {
    if (!currentUser || currentUser.role !== 'teacher') return [];
    return homework.filter(hw => hw.teacherId === currentUser.id);
  }, [currentUser, homework]);

  const filteredStudentHomework = useMemo(() => {
    if (!currentUser || currentUser.role !== 'student') return [];

    return homework.filter(hw => {
        const submission = submissions.find(s => s.studentId === currentUser.id && s.homeworkId === hw.id);
        switch(studentFilter) {
            case 'pending':
                return !submission;
            case 'submitted':
                return submission && submission.status === 'Submitted';
            case 'checked':
                return submission && (submission.status === 'Approved' || submission.status === 'Needs Revision');
            case 'all':
            default:
                return true;
        }
    });
  }, [currentUser, studentFilter, homework, submissions]);
  
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const studentHomework = currentUser.role === 'student' ? filteredStudentHomework : homework;

  return (
    <>
      <header className="app-header">
        <div className="container header-content">
          <div className="logo"><i className="fas fa-book-reader"></i> ระบบจัดการบ้าน</div>
          <div className="user-info"><span>ยินดีต้อนรับ, {currentUser.name}</span><button onClick={handleLogout} className="btn btn-secondary">ออกจากระบบ</button></div>
        </div>
      </header>
      <main className="container">
        <div className="dashboard-header">
          <h2>{currentUser.role === 'teacher' ? 'แดชบอร์ดของคุณ' : 'การบ้านของคุณ'}</h2>
          {currentUser.role === 'teacher' && (
              <div className="teacher-controls">
                  <div className="view-toggle">
                      <button className={`btn ${teacherView === 'assignments' ? 'active' : ''}`} onClick={() => setTeacherView('assignments')}>รายการการบ้าน</button>
                      <button className={`btn ${teacherView === 'students' ? 'active' : ''}`} onClick={() => setTeacherView('students')}>นักเรียน</button>
                  </div>
                  <button onClick={() => handleOpenModal('create', null)} className="btn btn-add-homework"><i className="fas fa-plus"></i> สร้าง</button>
              </div>
          )}
          {currentUser.role === 'student' && (
              <div className="student-filter-controls view-toggle">
                  <button className={`btn ${studentFilter === 'all' ? 'active' : ''}`} onClick={() => setStudentFilter('all')}>ทั้งหมด</button>
                  <button className={`btn ${studentFilter === 'pending' ? 'active' : ''}`} onClick={() => setStudentFilter('pending')}>รอส่ง</button>
                  <button className={`btn ${studentFilter === 'submitted' ? 'active' : ''}`} onClick={() => setStudentFilter('submitted')}>ส่งแล้ว</button>
                  <button className={`btn ${studentFilter === 'checked' ? 'active' : ''}`} onClick={() => setStudentFilter('checked')}>ตรวจแล้ว</button>
              </div>
          )}
        </div>
        
        {currentUser.role === 'teacher' && teacherView === 'students' ? (
            <StudentSubmissionsDashboard students={students} homework={teacherHomework} submissions={submissions} />
        ) : (
            <div className="homework-list">
                {(currentUser.role === 'teacher' ? teacherHomework : studentHomework).map(hw => (
                    <HomeworkCard 
                    key={hw.id} 
                    homework={hw}
                    onClick={() => currentUser.role === 'teacher' ? handleOpenModal('submissions', hw) : handleOpenModal('studentView', hw)}
                    userRole={currentUser.role}
                    read={currentUser.role === 'student' && readStatuses.find(rs => rs.studentId === currentUser.id && rs.homeworkId === hw.id)?.read}
                    studentInfo={{
                        submission: submissions.find(s => s.studentId === currentUser.id && s.homeworkId === hw.id),
                        stats: currentUser.role === 'teacher' ? getStatsForHomework(hw.id) : null,
                    }}
                    />
                ))}
            </div>
        )}
      </main>

      {isModalOpen && modalType === 'create' && (
            <HomeworkModal homework={null} onClose={handleCloseModals} onSave={handleSaveHomework} isCreating={true} currentUser={currentUser} submission={null} onHomeworkSubmit={null} onMarkAsRead={null} />
      )}
      {isModalOpen && modalType === 'studentView' && selectedHomework && currentUser.role === 'student' && (
            <HomeworkModal homework={selectedHomework} onClose={handleCloseModals} currentUser={currentUser} submission={submissions.find(s => s.studentId === currentUser.id && s.homeworkId === selectedHomework.id)} onHomeworkSubmit={handleHomeworkSubmit} onMarkAsRead={() => handleMarkAsRead(selectedHomework.id)} onSave={null} isCreating={false} />
      )}
      {isModalOpen && modalType === 'submissions' && selectedHomework && (
          <SubmissionsModal homework={selectedHomework} submissions={submissions} students={students} readStatuses={readStatuses} onClose={handleCloseModals} onUpdateStatus={handleUpdateSubmissionStatus} onTeacherSubmit={handleTeacherSubmitForStudent} />
      )}
      {isTeacherSubmitModalOpen && submissionTarget && (
        <TeacherSubmitModal
            student={students.find(s => s.id === submissionTarget.studentId)!}
            homework={homework.find(h => h.id === submissionTarget.homeworkId)!}
            onClose={() => {
                setTeacherSubmitModalOpen(false);
                setSubmissionTarget(null);
            }}
            onSubmit={handleConfirmTeacherSubmit}
        />
      )}
    </>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
