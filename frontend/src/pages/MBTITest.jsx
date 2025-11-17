import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { siswaAPI } from '../services/api';

const MBTITest = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [checking, setChecking] = useState(true);
    const [blocked, setBlocked] = useState(false);
    useEffect(() => {
        const checkExisting = async () => {
            try {
                setChecking(true);
                await siswaAPI.getMBTIResult();
                // If exists, block retest and redirect to results
                setBlocked(true);
                navigate('/student/my-results', { replace: true });
            } catch (e) {
                // 404 means no result yet; allow test
                setBlocked(false);
            } finally {
                setChecking(false);
            }
        };
        checkExisting();
    }, [navigate]);

    const questions = [
        // E vs I
        {
            id: 1, question: 'Di sebuah pesta, kamu cenderung...', options: [
                { value: 'E', text: 'Berbaur antusias dengan banyak orang' },
                { value: 'E', text: 'Mengobrol santai dengan beberapa orang baru' },
                { value: 'I', text: 'Tetap bersama kelompok kecil yang familiar' },
                { value: 'I', text: 'Mencari tempat tenang dengan satu teman' },
            ]
        },
        {
            id: 2, question: 'Energi kamu paling sering terisi kembali dengan...', options: [
                { value: 'E', text: 'Acara sosial yang aktif' },
                { value: 'E', text: 'Aktivitas kelompok yang spontan' },
                { value: 'I', text: 'Waktu sendiri untuk mengisi ulang' },
                { value: 'I', text: 'Percakapan empat mata' },
            ]
        },
        {
            id: 3, question: 'Saat bertemu orang baru, kamu...', options: [
                { value: 'E', text: 'Mengenalkan diri dengan percaya diri' },
                { value: 'E', text: 'Mudah memulai obrolan ringan' },
                { value: 'I', text: 'Menunggu didekati terlebih dahulu' },
                { value: 'I', text: 'Mengamati sebelum terlibat' },
            ]
        },
        {
            id: 4, question: 'Dalam diskusi kelas, kamu lebih suka...', options: [
                { value: 'E', text: 'Berpikir keras dan brainstorming' },
                { value: 'E', text: 'Berbagi ide saat muncul' },
                { value: 'I', text: 'Merenung dulu baru berbicara' },
                { value: 'I', text: 'Lebih banyak mendengar daripada berbicara' },
            ]
        },

        // S vs N
        {
            id: 5, question: 'Saat mempelajari topik baru, kamu lebih suka...', options: [
                { value: 'S', text: 'Fakta konkret dan contoh' },
                { value: 'S', text: 'Instruksi langkah demi langkah' },
                { value: 'N', text: 'Konsep gambaran besar' },
                { value: 'N', text: 'Pola dan kemungkinan' },
            ]
        },
        {
            id: 6, question: 'Ingatanmu lebih baik untuk...', options: [
                { value: 'S', text: 'Detail spesifik dan data' },
                { value: 'S', text: 'Pengalaman nyata' },
                { value: 'N', text: 'Ide dan tema umum' },
                { value: 'N', text: 'Keterkaitan antar konsep' },
            ]
        },
        {
            id: 7, question: 'Kamu paling percaya informasi yang...', options: [
                { value: 'S', text: 'Dapat diamati dan terbukti' },
                { value: 'S', text: 'Praktis dan teruji' },
                { value: 'N', text: 'Inovatif dan teoretis' },
                { value: 'N', text: 'Imajinatif dan berorientasi masa depan' },
            ]
        },
        {
            id: 8, question: 'Saat memecahkan masalah, kamu lebih mengandalkan...', options: [
                { value: 'S', text: 'Pengalaman sebelumnya' },
                { value: 'S', text: 'Prosedur yang andal' },
                { value: 'N', text: 'Sudut pandang dan wawasan baru' },
                { value: 'N', text: 'Intuisi tentang apa yang akan berhasil' },
            ]
        },

        // T vs F
        {
            id: 9, question: 'Dalam mengambil keputusan, kamu memprioritaskan...', options: [
                { value: 'T', text: 'Logika yang objektif' },
                { value: 'T', text: 'Kriteria yang adil dan konsisten' },
                { value: 'F', text: 'Dampaknya pada orang lain' },
                { value: 'F', text: 'Keharmonisan dan nilai-nilai' },
            ]
        },
        {
            id: 10, question: 'Umpan balik yang paling membantu kamu adalah...', options: [
                { value: 'T', text: 'Langsung dan analitis' },
                { value: 'T', text: 'Spesifik tentang apa yang perlu diperbaiki' },
                { value: 'F', text: 'Menyemangati dan mendukung' },
                { value: 'F', text: 'Peka terhadap perasaan' },
            ]
        },
        {
            id: 11, question: 'Perdebatan sebaiknya diselesaikan dengan...', options: [
                { value: 'T', text: 'Menimbang bukti secara rasional' },
                { value: 'T', text: 'Mencari jawaban paling logis' },
                { value: 'F', text: 'Memahami emosi yang terlibat' },
                { value: 'F', text: 'Mencari solusi yang penuh empati' },
            ]
        },
        {
            id: 12, question: 'Kamu lebih sering digambarkan sebagai...', options: [
                { value: 'T', text: 'Objektif dan terus terang' },
                { value: 'T', text: 'Kritis namun adil' },
                { value: 'F', text: 'Empatik dan baik' },
                { value: 'F', text: 'Bertenggang rasa dan penuh pertimbangan' },
            ]
        },

        // J vs P
        {
            id: 13, question: 'Jadwal belajarmu biasanya...', options: [
                { value: 'J', text: 'Direncanakan jauh-jauh hari' },
                { value: 'J', text: 'Tersusun dengan target yang jelas' },
                { value: 'P', text: 'Fleksibel dan mudah menyesuaikan' },
                { value: 'P', text: 'Spontan sesuai kebutuhan' },
            ]
        },
        {
            id: 14, question: 'Menjelang tenggat waktu, kamu...', options: [
                { value: 'J', text: 'Menyelesaikan lebih awal agar tidak stres' },
                { value: 'J', text: 'Memantau progres secara sistematis' },
                { value: 'P', text: 'Bekerja paling baik saat dikejar waktu' },
                { value: 'P', text: 'Menyesuaikan rencana sambil berjalan' },
            ]
        },
        {
            id: 15, question: 'Kamu lebih suka tugas yang...', options: [
                { value: 'J', text: 'Terdefinisi dengan jelas' },
                { value: 'J', text: 'Terstruktur dan terjadwal' },
                { value: 'P', text: 'Terbuka (tidak kaku)' },
                { value: 'P', text: 'Eksploratif dan berkembang' },
            ]
        },
        {
            id: 16, question: 'Ruang kerjamu cenderung...', options: [
                { value: 'J', text: 'Rapi dan tertata' },
                { value: 'J', text: 'Diberi label dan dikategorikan' },
                { value: 'P', text: 'Kreatif dan dinamis' },
                { value: 'P', text: 'Tertata dengan caramu sendiri' },
            ]
        },

        // Additional rounds for balance (E/I, S/N, T/F, J/P)
        {
            id: 17, question: 'Proyek kelompok bagi kamu adalah...', options: [
                { value: 'E', text: 'Menyenangkan dan memberi energi' },
                { value: 'E', text: 'Cocok untuk brainstorming' },
                { value: 'I', text: 'Oke jika peran jelas' },
                { value: 'I', text: 'Lebih suka subkelompok kecil' },
            ]
        },
        {
            id: 18, question: 'Saat membaca, kamu fokus pada...', options: [
                { value: 'S', text: 'Fakta dan data yang disajikan' },
                { value: 'S', text: 'Instruksi yang jelas' },
                { value: 'N', text: 'Tema yang mendasari' },
                { value: 'N', text: 'Makna tersembunyi' },
            ]
        },
        {
            id: 19, question: 'Keputusanmu bertujuan untuk...', options: [
                { value: 'T', text: 'Ketepatan dan akurasi' },
                { value: 'T', text: 'Konsisten dengan aturan' },
                { value: 'F', text: 'Kebaikan dan empati' },
                { value: 'F', text: 'Menjaga hubungan' },
            ]
        },
        {
            id: 20, question: 'Di akhir pekan, kamu biasanya...', options: [
                { value: 'J', text: 'Mengikuti agenda yang direncanakan' },
                { value: 'J', text: 'Menjadwalkan tugas dan istirahat' },
                { value: 'P', text: 'Mengalir sesuai keadaan' },
                { value: 'P', text: 'Melihat peluang yang muncul' },
            ]
        },

        {
            id: 21, question: 'Di lingkungan baru, kamu...', options: [
                { value: 'E', text: 'Cepat terjun ke aktivitas' },
                { value: 'E', text: 'Memulai percakapan' },
                { value: 'I', text: 'Beradaptasi dengan tenang' },
                { value: 'I', text: 'Mengamati sebelum terlibat' },
            ]
        },
        {
            id: 22, question: 'Untuk instruksi, kamu lebih suka...', options: [
                { value: 'S', text: 'Langkah yang jelas dan konkret' },
                { value: 'S', text: 'Contoh dan demo' },
                { value: 'N', text: 'Tujuan dan visi terlebih dahulu' },
                { value: 'N', text: 'Metafora dan konsep' },
            ]
        },
        {
            id: 23, question: 'Dalam menilai keadilan, kamu menghargai...', options: [
                { value: 'T', text: 'Kriteria yang objektif' },
                { value: 'T', text: 'Standar yang seragam' },
                { value: 'F', text: 'Kondisi individu' },
                { value: 'F', text: 'Umpan balik yang mendukung' },
            ]
        },
        {
            id: 24, question: 'Daftar tugasmu (to-do) adalah...', options: [
                { value: 'J', text: 'Hal wajib setiap hari' },
                { value: 'J', text: 'Ditandai selesai secara rutin' },
                { value: 'P', text: 'Dipakai longgar saat perlu' },
                { value: 'P', text: 'Opsional dan fleksibel' },
            ]
        },

        {
            id: 25, question: 'Media sosial bagimu adalah...', options: [
                { value: 'E', text: 'Cara untuk terhubung luas' },
                { value: 'E', text: 'Menyenangkan untuk berbagi kabar' },
                { value: 'I', text: 'Utamanya untuk teman dekat' },
                { value: 'I', text: 'Dipakai sesekali dan terbatas' },
            ]
        },
        {
            id: 26, question: 'Dalam praktikum/proyek, kamu lebih suka...', options: [
                { value: 'S', text: 'Mengikuti prosedur yang terbukti' },
                { value: 'S', text: 'Eksperimen langsung (hands-on)' },
                { value: 'N', text: 'Mencoba pendekatan baru' },
                { value: 'N', text: 'Merancang metode baru' },
            ]
        },
        {
            id: 27, question: 'Saat teman butuh bantuan, kamu...', options: [
                { value: 'T', text: 'Memberikan solusi dan perbaikan' },
                { value: 'T', text: 'Menganalisis masalahnya' },
                { value: 'F', text: 'Mendengar dan berempati' },
                { value: 'F', text: 'Menyemangati dan mendukung' },
            ]
        },
        {
            id: 28, question: 'Pendekatanmu terhadap rencana adalah...', options: [
                { value: 'J', text: 'Membuat dan menaatinya' },
                { value: 'J', text: 'Berpegang pada jadwal' },
                { value: 'P', text: 'Membiarkan opsi tetap terbuka' },
                { value: 'P', text: 'Menyesuaikan secara spontan' },
            ]
        },

        {
            id: 29, question: 'Acara networking terasa...', options: [
                { value: 'E', text: 'Menyenangkan dan memberi energi' },
                { value: 'E', text: 'Peluang untuk terhubung' },
                { value: 'I', text: 'Melelahkan tapi masih bisa dijalani' },
                { value: 'I', text: 'Lebih suka melewatkannya' },
            ]
        },
        {
            id: 30, question: 'Kuliah/ceramah paling baik ketika...', options: [
                { value: 'S', text: 'Menyertakan contoh konkret' },
                { value: 'S', text: 'Menyediakan data dan studi kasus' },
                { value: 'N', text: 'Menyajikan gagasan besar' },
                { value: 'N', text: 'Mengeksplorasi berbagai kemungkinan' },
            ]
        },
        {
            id: 31, question: 'Saat memberi umpan balik, kamu fokus pada...', options: [
                { value: 'T', text: 'Apa yang perlu ditingkatkan' },
                { value: 'T', text: 'Akurasi dan kejelasan' },
                { value: 'F', text: 'Perasaan dan penyemangat' },
                { value: 'F', text: 'Motivasi dan kepedulian' },
            ]
        },
        {
            id: 32, question: 'Kalendermu adalah...', options: [
                { value: 'J', text: 'Tertata dan selalu diperbarui' },
                { value: 'J', text: 'Dipakai harian untuk merencanakan' },
                { value: 'P', text: 'Panduan kasar' },
                { value: 'P', text: 'Dicek saat diperlukan' },
            ]
        },
    ];

    const handleAnswer = async (value) => {
        const newAnswers = { ...answers, [currentQuestion]: value };
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Calculate MBTI type and save to backend
            const result = calculateMBTI(newAnswers);
            try {
                await siswaAPI.uploadMBTIResult({ mbti_type: result });
            } catch (e) {
                // Non-blocking; still navigate to results
                console.error('Gagal menyimpan hasil MBTI:', e);
            }
            navigate('/student/my-results', { state: { mbtiType: result } });
        }
    };

    const calculateMBTI = (answers) => {
        // Simple calculation - count occurrences
        const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        Object.values(answers).forEach(value => {
            counts[value]++;
        });

        const type =
            (counts.E > counts.I ? 'E' : 'I') +
            (counts.S > counts.N ? 'S' : 'N') +
            (counts.T > counts.F ? 'T' : 'F') +
            (counts.J > counts.P ? 'J' : 'P');

        return type;
    };

    const progress = ((currentQuestion + 1) / questions.length) * 100;

    if (checking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Memeriksa status tes MBTI...</div>
        );
    }

    if (blocked) {
        return null; // Redirected to results already
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-blue-600 rounded-full mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tes Kepribadian MBTI</h1>
                    <p className="text-gray-600">Temukan gaya belajar Anda</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Pertanyaan {currentQuestion + 1} dari {questions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        {questions[currentQuestion].question}
                    </h2>

                    <div className="space-y-4">
                        {questions[currentQuestion].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option.value)}
                                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                            >
                                <span className="text-gray-900 font-medium">{option.text}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                {currentQuestion > 0 && (
                    <button
                        onClick={() => setCurrentQuestion(currentQuestion - 1)}
                        className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Pertanyaan Sebelumnya
                    </button>
                )}
            </div>
        </div>
    );
};

export default MBTITest;
