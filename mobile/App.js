import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  ScrollView, ActivityIndicator, StatusBar, TextInput,
  Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// GANTI dengan URL Vercel milikmu (https://.../api) atau IP laptop (http://192.168.x.x:3000/api)
const API_BASE = 'https://edubank-app.vercel.app/api';

const FALLBACK_MODULES = [
  {
    id: "mod-01",
    code: "MAT-B4-01",
    title: "Pecahan Senilai dan Desimal Persepuluhan",
    subject: "Matematika",
    phase: "Fase B - Kelas 4 SD",
    duration: "6 JP (2 Pertemuan)",
    cp: "Peserta didik dapat membandingkan dan mengurutkan antar-pecahan serta mengenali pecahan senilai.",
    tp: [
      "Mengidentifikasi pecahan senilai melalui media visual dan garis bilangan.",
      "Mengubah pecahan biasa berpenyebut 10 dan 100 menjadi bentuk desimal.",
      "Menyelesaikan masalah sehari-hari yang berkaitan dengan pecahan senilai."
    ],
    atp: "Konsep pecahan dasar -> Eksplorasi pecahan senilai -> Konversi pecahan ke desimal -> Evaluasi kontekstual.",
    summary: "Membahas konsep pecahan senilai dengan pendekatan konkret-piktorial-abstrak serta konversi desimal.",
    deletedAt: null
  },
  {
    id: "mod-02",
    code: "PPKN-B4-02",
    title: "Makna Sila Pancasila dan Keragaman Budaya Daerah",
    subject: "Pendidikan Pancasila",
    phase: "Fase B - Kelas 4 SD",
    duration: "4 JP (2 Pertemuan)",
    cp: "Peserta didik mampu memahami makna sila-sila Pancasila serta menceritakan contoh penerapannya.",
    tp: [
      "Menjelaskan hubungan simbol dengan makna sila-sila Pancasila.",
      "Mengidentifikasi bentuk keragaman budaya dan kearifan lokal di lingkungan sekitar.",
      "Mendemonstrasikan sikap gotong royong dan toleransi di sekolah."
    ],
    atp: "Pengenalan simbol Pancasila -> Analisis studi kasus di sekolah -> Proyek pemetaan budaya lokal.",
    summary: "Mengarahkan siswa memahami pengamalan nilai Pancasila melalui kerja bakti dan musyawarah kelas.",
    deletedAt: null
  },
  {
    id: "mod-03",
    code: "BIN-B4-03",
    title: "Ide Pokok dan Teks Laporan Hasil Pengamatan",
    subject: "Bahasa Indonesia",
    phase: "Fase B - Kelas 4 SD",
    duration: "6 JP (3 Pertemuan)",
    cp: "Peserta didik mampu memahami ide pokok pada teks informatif serta menulis teks laporan pengamatan.",
    tp: [
      "Menentukan kalimat utama dan ide pokok dari setiap paragraf teks informatif.",
      "Membedakan kalimat fakta dan opini dalam teks bacaan.",
      "Menyusun laporan hasil pengamatan lingkungan sekolah secara sistematis."
    ],
    atp: "Membaca intensif teks informatif -> Latihan mencari ide pokok -> Observasi lapangan -> Penulisan laporan.",
    summary: "Panduan membedah struktur paragraf induktif-deduktif serta praktik menyusun laporan pengamatan.",
    deletedAt: null
  },
  {
    id: "mod-04",
    code: "PKLH-B4-04",
    title: "Pelestarian Flora Fauna Endemik dan Ruang Terbuka Hijau",
    subject: "PKLH (Muatan Lokal)",
    phase: "Fase B - Kelas 4 SD",
    duration: "4 JP (2 Pertemuan)",
    cp: "Peserta didik mengenal keanekaragaman hayati lokal serta berperan aktif menjaga kebersihan taman kota.",
    tp: [
      "Mengenal ciri khas flora dan fauna endemik seperti Beruang Madu dan Anggrek Hitam.",
      "Menjelaskan fungsi ruang terbuka hijau seperti Taman Bekapai dan Taman Tiga Generasi.",
      "Mempraktikkan pemilahan sampah organik dan anorganik di sekolah."
    ],
    atp: "Observasi ekosistem lokal -> Diskusi fungsi taman kota -> Kampanye kebersihan lingkungan.",
    summary: "Materi kontekstual pengenalan ekosistem daerah, pelestarian satwa dilindungi, dan kebersihan taman kota.",
    deletedAt: null
  }
];

const FALLBACK_QBANKS = [
  {
    id: "qb-01",
    code: "SAS-MAT-04",
    title: "Paket Soal Sumatif Matematika: Pecahan & Desimal",
    subject: "Matematika",
    phase: "Fase B - Kelas 4 SD",
    taxonomyFocus: "Bloom C2-C4 & SOLO Multistructural-Relational",
    totalItems: 3,
    deletedAt: null,
    questions: [
      {
        no: 1,
        stem: "Ibu memotong sebuah kue bolu menjadi 8 bagian sama besar. Andi memakan 2 bagian kue tersebut. Pecahan yang senilai dengan bagian kue yang dimakan Andi adalah...",
        bloom: "C3 (Mengaplikasikan)",
        solo: "Relational",
        options: ["A. 1/4", "B. 1/3", "C. 2/4", "D. 3/8"],
        answer: "A. 1/4",
        explanation: "Bagian yang dimakan Andi adalah 2/8. Pembilang dan penyebut dibagi 2 menghasilkan 1/4."
      },
      {
        no: 2,
        stem: "Bentuk pecahan desimal dari 7/10 adalah...",
        bloom: "C2 (Memahami)",
        solo: "Unistructural",
        options: ["A. 0,07", "B. 0,7", "C. 7,0", "D. 1,7"],
        answer: "B. 0,7",
        explanation: "Pecahan berpenyebut 10 memiliki satu angka di belakang koma, sehingga ditulis 0,7."
      },
      {
        no: 3,
        stem: "Manakah urutan pecahan berikut yang disusun dari nilai terkecil ke terbesar?",
        bloom: "C4 (Menganalisis)",
        solo: "Relational",
        options: ["A. 1/2, 1/4, 3/4", "B. 1/4, 1/2, 3/4", "C. 3/4, 1/2, 1/4", "D. 1/4, 3/4, 1/2"],
        answer: "B. 1/4, 1/2, 3/4",
        explanation: "Jika disamakan penyebutnya menjadi perempat: 1/4, 2/4 (1/2), dan 3/4."
      }
    ]
  },
  {
    id: "qb-02",
    code: "SAS-PPKN-04",
    title: "Paket Soal Sumatif Pendidikan Pancasila",
    subject: "Pendidikan Pancasila",
    phase: "Fase B - Kelas 4 SD",
    taxonomyFocus: "Bloom C2-C4 & SOLO Relational",
    totalItems: 2,
    deletedAt: null,
    questions: [
      {
        no: 1,
        stem: "Siswa kelas 4B mengadakan musyawarah untuk menentukan pengurus kelas. Kegiatan tersebut mencerminkan pengamalan Pancasila sila ke...",
        bloom: "C3 (Mengaplikasikan)",
        solo: "Multistructural",
        options: ["A. Kedua", "B. Ketiga", "C. Keempat", "D. Kelima"],
        answer: "C. Keempat",
        explanation: "Musyawarah mufakat merupakan wujud pengamalan sila keempat berlambang Kepala Banteng."
      },
      {
        no: 2,
        stem: "Mengapa kita harus menghargai teman yang berbeda suku dan budaya di sekolah?",
        bloom: "C4 (Menganalisis)",
        solo: "Extended Abstract",
        options: [
          "A. Agar mendapat pujian dari guru kelas",
          "B. Untuk menjaga persatuan sesuai semboyan Bhinneka Tunggal Ika",
          "C. Supaya teman mau mengerjakan tugas kita",
          "D. Karena diwajibkan saat ujian saja"
        ],
        answer: "B. Untuk menjaga persatuan sesuai semboyan Bhinneka Tunggal Ika",
        explanation: "Menghormati perbedaan budaya memperkuat persatuan dan kerukunan di sekolah."
      }
    ]
  },
  {
    id: "qb-03",
    code: "SAS-PKLH-04",
    title: "Paket Evaluasi PKLH: Konservasi & Taman Kota",
    subject: "PKLH (Muatan Lokal)",
    phase: "Fase B - Kelas 4 SD",
    taxonomyFocus: "Bloom C1-C3 & SOLO Relational",
    totalItems: 2,
    deletedAt: null,
    questions: [
      {
        no: 1,
        stem: "Satwa endemik yang menjadi maskot daerah dan dilindungi karena habitat hutannya berkurang adalah...",
        bloom: "C1 (Mengingat)",
        solo: "Unistructural",
        options: ["A. Komodo", "B. Beruang Madu", "C. Cenderawasih", "D. Jalak Bali"],
        answer: "B. Beruang Madu",
        explanation: "Beruang Madu (Helarctos malayanus) adalah satwa ikonik Kalimantan Timur yang dilindungi."
      },
      {
        no: 2,
        stem: "Saat berkunjung ke Taman Tiga Generasi, tindakan yang tepat untuk menjaga kebersihan taman adalah...",
        bloom: "C3 (Mengaplikasikan)",
        solo: "Relational",
        options: [
          "A. Memetik bunga taman untuk dibawa pulang",
          "B. Membuang bungkus makanan sesuai kategori tempat sampah terpilah",
          "C. Memberi makan satwa secara sembarangan",
          "D. Menginjak rumput taman untuk berfoto"
        ],
        answer: "B. Membuang bungkus makanan sesuai kategori tempat sampah terpilah",
        explanation: "Memilah sampah organik dan anorganik membantu pengelolaan kebersihan ruang terbuka hijau."
      }
    ]
  }
];

function showNotice(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function confirmAction(title, message, onConfirm, confirmLabel = 'Ya, Lanjutkan') {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Batal', style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: onConfirm }
    ]);
  }
}

function formatDeletedTime(isoString) {
  if (!isoString) return 'Baru saja';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return 'Baru saja';
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

async function safeFetchJson(url, fallbackData) {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) {
      return fallbackData;
    }
    const json = await response.json();
    return json.data ?? fallbackData;
  } catch (error) {
    return fallbackData;
  }
}

// Soft delete -> Pindah ke Sampah
async function softDeleteResource(endpointPath, id, fallbackArray) {
  try {
    const response = await fetch(`${API_BASE}/${endpointPath}/${id}`, { method: 'DELETE' });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) throw new Error('Offline');
    return { online: true };
  } catch (error) {
    const item = fallbackArray.find(x => x.id === id);
    if (item) item.deletedAt = new Date().toISOString();
    return { online: false };
  }
}

// Restore -> Pulihkan dari Sampah
async function restoreResource(endpointPath, id, fallbackArray) {
  try {
    const response = await fetch(`${API_BASE}/${endpointPath}/${id}/restore`, { method: 'PATCH' });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) throw new Error('Offline');
    return { online: true };
  } catch (error) {
    const item = fallbackArray.find(x => x.id === id);
    if (item) item.deletedAt = null;
    return { online: false };
  }
}

// Permanent delete -> Hapus selamanya dari Sampah
async function permanentDeleteResource(endpointPath, id, fallbackArray) {
  try {
    const response = await fetch(`${API_BASE}/${endpointPath}/${id}/permanent`, { method: 'DELETE' });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) throw new Error('Offline');
    return { online: true };
  } catch (error) {
    const idx = fallbackArray.findIndex(x => x.id === id);
    if (idx !== -1) fallbackArray.splice(idx, 1);
    return { online: false };
  }
}

const Tab = createBottomTabNavigator();
const ModulStack = createNativeStackNavigator();
const SoalStack = createNativeStackNavigator();

// ==========================================
// HALAMAN 1: LIST KATALOG MODUL AJAR
// ==========================================
function ModuleListScreen({ navigation }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = useCallback(() => {
    setLoading(true);
    const activeFallback = FALLBACK_MODULES.filter(m => !m.deletedAt);
    safeFetchJson(`${API_BASE}/modules`, activeFallback)
      .then(data => setModules([...data]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchModules();
    }, [fetchModules])
  );

  const handleSoftDeleteModule = (item) => {
    confirmAction(
      'Pindahkan ke Sampah?',
      `Modul "${item.title}" akan dipindahkan ke menu Sampah dan masih bisa dipulihkan.`,
      async () => {
        const res = await softDeleteResource('modules', item.id, FALLBACK_MODULES);
        setModules(prev => prev.filter(m => m.id !== item.id));
        showNotice(
          'Dipindahkan ke Sampah',
          res.online
            ? 'Modul masuk ke menu Sampah. Kamu bisa memulihkannya kapan saja.'
            : 'Modul masuk ke Sampah (Mode Offline).'
        );
      },
      'Pindahkan'
    );
  };

  if (loading && modules.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={modules}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 88 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada modul ajar. Tekan tombol + untuk menambah.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ModuleDetail', { id: item.id })}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.subject} • {item.phase}</Text>
              </View>
              <View style={styles.iconGroup}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddModule', { moduleToEdit: item })}
                  style={styles.iconActionBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
                >
                  <Ionicons name="create-outline" size={19} color="#d97706" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSoftDeleteModule(item)}
                  style={styles.iconActionBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.summary}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddModule')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ==========================================
// HALAMAN 2: DETAIL MODUL AJAR
// ==========================================
function ModuleDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(() => {
    setLoading(true);
    const fallbackItem = FALLBACK_MODULES.find(m => m.id === id && !m.deletedAt);
    safeFetchJson(`${API_BASE}/modules/${id}`, fallbackItem)
      .then(data => setDetail(data))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail])
  );

  const handleSoftDelete = () => {
    confirmAction(
      'Pindahkan ke Sampah?',
      `Modul "${detail.title}" akan dipindahkan ke menu Sampah dan masih bisa dipulihkan.`,
      async () => {
        await softDeleteResource('modules', id, FALLBACK_MODULES);
        showNotice('Dipindahkan ke Sampah', 'Modul masih bisa dipulihkan dari tab Sampah.');
        navigation.goBack();
      },
      'Pindahkan'
    );
  };

  if (loading || !detail) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const tpList = Array.isArray(detail.tp) ? detail.tp : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={styles.detailBox}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{detail.code} • {detail.duration}</Text>
        </View>
        <Text style={styles.detailTitle}>{detail.title}</Text>
        <Text style={styles.cardDesc}>{detail.subject} • {detail.phase}</Text>

        <Text style={styles.sectionLabel}>RINGKASAN</Text>
        <Text style={styles.bodyText}>{detail.summary}</Text>

        <Text style={styles.sectionLabel}>CAPAIAN PEMBELAJARAN (CP)</Text>
        <Text style={styles.bodyText}>{detail.cp}</Text>

        <Text style={styles.sectionLabel}>TUJUAN PEMBELAJARAN (TP)</Text>
        {tpList.map((point, index) => (
          <Text key={index} style={styles.listItem}>• {point}</Text>
        ))}

        <Text style={styles.sectionLabel}>ALUR TUJUAN PEMBELAJARAN (ATP)</Text>
        <Text style={styles.bodyText}>{detail.atp}</Text>
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('AddModule', { moduleToEdit: detail })}
      >
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={styles.actionBtnText}>Edit Modul Ajar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleSoftDelete}>
        <Ionicons name="trash-outline" size={18} color="#fff" />
        <Text style={styles.actionBtnText}>Pindahkan ke Sampah</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==========================================
// HALAMAN 3: FORM TAMBAH & EDIT MODUL
// ==========================================
function AddModuleScreen({ route, navigation }) {
  const moduleToEdit = route.params?.moduleToEdit || null;
  const isEdit = Boolean(moduleToEdit);

  const [title, setTitle] = useState(moduleToEdit?.title || '');
  const [subject, setSubject] = useState(moduleToEdit?.subject || '');
  const [phase, setPhase] = useState(moduleToEdit?.phase || 'Fase B - Kelas 4 SD');
  const [duration, setDuration] = useState(moduleToEdit?.duration || '4 JP (2 Pertemuan)');
  const [summary, setSummary] = useState(moduleToEdit?.summary || '');
  const [cp, setCp] = useState(moduleToEdit?.cp || '');
  const [tpText, setTpText] = useState(
    Array.isArray(moduleToEdit?.tp) ? moduleToEdit.tp.join('\n') : ''
  );
  const [atp, setAtp] = useState(moduleToEdit?.atp || '');
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEdit ? 'Edit Modul Ajar' : 'Tambah Modul Ajar'
    });
  }, [navigation, isEdit]);

  const handleSave = async () => {
    if (!title.trim() || !subject.trim()) {
      showNotice('Data Belum Lengkap', 'Judul modul dan mata pelajaran wajib diisi.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      subject: subject.trim(),
      phase: phase.trim(),
      duration: duration.trim(),
      summary: summary.trim(),
      cp: cp.trim(),
      tp: tpText.split('\n').map(line => line.trim()).filter(Boolean),
      atp: atp.trim()
    };

    const url = isEdit ? `${API_BASE}/modules/${moduleToEdit.id}` : `${API_BASE}/modules`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) throw new Error('Offline');

      showNotice(
        'Berhasil',
        isEdit
          ? 'Perubahan modul ajar berhasil disimpan ke database Supabase.'
          : 'Modul ajar baru berhasil disimpan ke database Supabase.'
      );
      navigation.goBack();
    } catch (error) {
      const normalizedTp = payload.tp.length > 0 ? payload.tp : ['-'];
      if (isEdit) {
        const idx = FALLBACK_MODULES.findIndex(m => m.id === moduleToEdit.id);
        if (idx !== -1) {
          FALLBACK_MODULES[idx] = {
            ...FALLBACK_MODULES[idx],
            ...payload,
            tp: normalizedTp,
            summary: payload.summary || 'Modul pembelajaran Kurikulum Merdeka.',
            cp: payload.cp || '-',
            atp: payload.atp || '-'
          };
        }
        showNotice('Diperbarui Lokal', 'Server API belum terjangkau. Perubahan disimpan sementara.');
      } else {
        FALLBACK_MODULES.unshift({
          id: `mod-${Date.now().toString().slice(-4)}`,
          code: `${subject.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'MOD'}-B4-NEW`,
          ...payload,
          tp: normalizedTp,
          summary: payload.summary || 'Modul pembelajaran Kurikulum Merdeka.',
          cp: payload.cp || '-',
          atp: payload.atp || '-',
          deletedAt: null
        });
        showNotice('Tersimpan Lokal', 'Server API belum terjangkau. Data disimpan sementara.');
      }
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.detailBox}>
          <Text style={styles.inputLabel}>Judul Modul Ajar *</Text>
          <TextInput style={styles.input} placeholder="Contoh: Wujud Zat dan Perubahannya" value={title} onChangeText={setTitle} />

          <Text style={styles.inputLabel}>Mata Pelajaran *</Text>
          <TextInput style={styles.input} placeholder="Contoh: IPAS / Matematika" value={subject} onChangeText={setSubject} />

          <Text style={styles.inputLabel}>Fase / Kelas</Text>
          <TextInput style={styles.input} value={phase} onChangeText={setPhase} />

          <Text style={styles.inputLabel}>Alokasi Waktu</Text>
          <TextInput style={styles.input} value={duration} onChangeText={setDuration} />

          <Text style={styles.inputLabel}>Ringkasan Singkat</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Deskripsi singkat isi modul..." multiline value={summary} onChangeText={setSummary} />

          <Text style={styles.inputLabel}>Capaian Pembelajaran (CP)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Tulis Capaian Pembelajaran..." multiline value={cp} onChangeText={setCp} />

          <Text style={styles.inputLabel}>Tujuan Pembelajaran (Pisahkan dengan Enter)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder={"Poin tujuan 1\nPoin tujuan 2"} multiline value={tpText} onChangeText={setTpText} />

          <Text style={styles.inputLabel}>Alur Tujuan Pembelajaran (ATP)</Text>
          <TextInput style={styles.input} placeholder="Contoh: Pengamatan -> Praktikum -> Evaluasi" value={atp} onChangeText={setAtp} />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              isEdit && { backgroundColor: '#d97706' },
              submitting && { opacity: 0.6 }
            ]}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isEdit ? 'Simpan Perubahan Modul' : 'Simpan Modul Ajar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// HALAMAN 4: LIST BANK SOAL
// ==========================================
function QBankListScreen({ navigation }) {
  const [qbanks, setQbanks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQBanks = useCallback(() => {
    setLoading(true);
    const activeFallback = FALLBACK_QBANKS.filter(q => !q.deletedAt);
    safeFetchJson(`${API_BASE}/question-banks`, activeFallback)
      .then(data => setQbanks([...data]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchQBanks();
    }, [fetchQBanks])
  );

  const handleSoftDeleteBank = (item) => {
    confirmAction(
      'Pindahkan ke Sampah?',
      `Paket soal "${item.title}" akan dipindahkan ke menu Sampah dan masih bisa dipulihkan.`,
      async () => {
        const res = await softDeleteResource('question-banks', item.id, FALLBACK_QBANKS);
        setQbanks(prev => prev.filter(q => q.id !== item.id));
        showNotice(
          'Dipindahkan ke Sampah',
          res.online
            ? 'Paket soal masuk ke menu Sampah. Kamu bisa memulihkannya kapan saja.'
            : 'Paket soal masuk ke Sampah (Mode Offline).'
        );
      },
      'Pindahkan'
    );
  };

  if (loading && qbanks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={qbanks}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 88 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada paket soal. Tekan tombol + untuk membuat paket baru.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('QBankDetail', { id: item.id })}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.subject} • {item.totalItems} Soal</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleSoftDeleteBank(item)}
                style={styles.iconActionBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>Kognitif: {item.taxonomyFocus}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddQBank')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ==========================================
// HALAMAN 5: DETAIL BANK SOAL
// ==========================================
function QBankDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallbackItem = FALLBACK_QBANKS.find(q => q.id === id && !q.deletedAt);
    safeFetchJson(`${API_BASE}/question-banks/${id}`, fallbackItem)
      .then(data => setBank(data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSoftDelete = () => {
    confirmAction(
      'Pindahkan ke Sampah?',
      `Paket soal "${bank.title}" akan dipindahkan ke menu Sampah dan masih bisa dipulihkan.`,
      async () => {
        await softDeleteResource('question-banks', id, FALLBACK_QBANKS);
        showNotice('Dipindahkan ke Sampah', 'Paket soal masih bisa dipulihkan dari tab Sampah.');
        navigation.goBack();
      },
      'Pindahkan'
    );
  };

  if (loading || !bank) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={styles.detailBox}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{bank.code} • {bank.phase}</Text>
        </View>
        <Text style={styles.detailTitle}>{bank.title}</Text>
        <Text style={styles.cardDesc}>Level Kognitif: {bank.taxonomyFocus}</Text>
      </View>

      {bank.questions.map(q => (
        <View key={q.no} style={styles.questionCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{q.bloom} | SOLO: {q.solo}</Text>
          </View>
          <Text style={styles.questionStem}>{q.no}. {q.stem}</Text>
          {q.options.map((opt, idx) => (
            <View key={idx} style={styles.optionBox}>
              <Text style={styles.optionText}>{opt}</Text>
            </View>
          ))}
          <View style={styles.answerBox}>
            <Text style={styles.answerTitle}>Kunci: {q.answer}</Text>
            <Text style={styles.answerExp}>{q.explanation}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.deleteBtn} onPress={handleSoftDelete}>
        <Ionicons name="trash-outline" size={18} color="#fff" />
        <Text style={styles.actionBtnText}>Pindahkan ke Sampah</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==========================================
// HALAMAN 6: FORM BUAT PAKET BANK SOAL
// ==========================================
function createEmptyQuestion() {
  return {
    stem: '',
    bloom: 'C3 (Mengaplikasikan)',
    solo: 'Relational',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    answer: '',
    explanation: ''
  };
}

function AddQBankScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [phase, setPhase] = useState('Fase B - Kelas 4 SD');
  const [taxonomyFocus, setTaxonomyFocus] = useState('Bloom C2-C4 & SOLO Relational');
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [submitting, setSubmitting] = useState(false);

  const updateQuestionField = (index, field, value) => {
    setQuestions(prev => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const addQuestionSlot = () => setQuestions(prev => [...prev, createEmptyQuestion()]);

  const removeQuestionSlot = (index) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() || !subject.trim()) {
      showNotice('Data Belum Lengkap', 'Judul paket soal dan mata pelajaran wajib diisi.');
      return;
    }

    const validItems = questions.filter(q => q.stem.trim() !== '');
    if (validItems.length === 0) {
      showNotice('Soal Kosong', 'Isi minimal 1 pertanyaan soal sebelum menyimpan.');
      return;
    }

    const formattedQuestions = validItems.map((q, idx) => ({
      no: idx + 1,
      stem: q.stem.trim(),
      bloom: q.bloom.trim() || 'C2 (Memahami)',
      solo: q.solo.trim() || 'Multistructural',
      options: [
        `A. ${q.optA.trim() || '-'}`,
        `B. ${q.optB.trim() || '-'}`,
        `C. ${q.optC.trim() || '-'}`,
        `D. ${q.optD.trim() || '-'}`
      ],
      answer: q.answer.trim() || `A. ${q.optA.trim() || '-'}`,
      explanation: q.explanation.trim() || '-'
    }));

    const payload = {
      title: title.trim(),
      subject: subject.trim(),
      phase: phase.trim(),
      taxonomyFocus: taxonomyFocus.trim(),
      questions: formattedQuestions
    };

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/question-banks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) throw new Error('Offline');

      showNotice('Berhasil', 'Paket bank soal baru berhasil disimpan ke database Supabase.');
      navigation.goBack();
    } catch (error) {
      FALLBACK_QBANKS.unshift({
        id: `qb-${Date.now().toString().slice(-4)}`,
        code: `SAS-${subject.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'SOAL'}-NEW`,
        ...payload,
        totalItems: formattedQuestions.length,
        deletedAt: null
      });
      showNotice('Tersimpan Lokal', 'Server API belum terjangkau. Paket soal disimpan sementara.');
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>Informasi Paket Soal</Text>

          <Text style={styles.inputLabel}>Judul Paket Soal *</Text>
          <TextInput style={styles.input} placeholder="Contoh: Sumatif IPAS Wujud Zat" value={title} onChangeText={setTitle} />

          <Text style={styles.inputLabel}>Mata Pelajaran *</Text>
          <TextInput style={styles.input} placeholder="Contoh: IPAS / Matematika" value={subject} onChangeText={setSubject} />

          <Text style={styles.inputLabel}>Fase / Kelas</Text>
          <TextInput style={styles.input} value={phase} onChangeText={setPhase} />

          <Text style={styles.inputLabel}>Fokus Taksonomi</Text>
          <TextInput style={styles.input} value={taxonomyFocus} onChangeText={setTaxonomyFocus} />
        </View>

        {questions.map((q, index) => (
          <View key={index} style={styles.detailBox}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.detailTitle}>Butir Soal #{index + 1}</Text>
              {questions.length > 1 && (
                <TouchableOpacity onPress={() => removeQuestionSlot(index)} style={styles.iconActionBtn}>
                  <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.inputLabel}>Pertanyaan *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Tulis teks soal di sini..." multiline value={q.stem} onChangeText={val => updateQuestionField(index, 'stem', val)} />

            <Text style={styles.inputLabel}>Level Bloom</Text>
            <TextInput style={styles.input} value={q.bloom} onChangeText={val => updateQuestionField(index, 'bloom', val)} />

            <Text style={styles.inputLabel}>Level SOLO</Text>
            <TextInput style={styles.input} value={q.solo} onChangeText={val => updateQuestionField(index, 'solo', val)} />

            <Text style={styles.inputLabel}>Opsi A</Text>
            <TextInput style={styles.input} placeholder="Jawaban A" value={q.optA} onChangeText={val => updateQuestionField(index, 'optA', val)} />

            <Text style={styles.inputLabel}>Opsi B</Text>
            <TextInput style={styles.input} placeholder="Jawaban B" value={q.optB} onChangeText={val => updateQuestionField(index, 'optB', val)} />

            <Text style={styles.inputLabel}>Opsi C</Text>
            <TextInput style={styles.input} placeholder="Jawaban C" value={q.optC} onChangeText={val => updateQuestionField(index, 'optC', val)} />

            <Text style={styles.inputLabel}>Opsi D</Text>
            <TextInput style={styles.input} placeholder="Jawaban D" value={q.optD} onChangeText={val => updateQuestionField(index, 'optD', val)} />

            <Text style={styles.inputLabel}>Kunci Jawaban</Text>
            <TextInput style={styles.input} placeholder="Contoh: B. Mengembun" value={q.answer} onChangeText={val => updateQuestionField(index, 'answer', val)} />

            <Text style={styles.inputLabel}>Pembahasan</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Penjelasan singkat jawaban benar..." multiline value={q.explanation} onChangeText={val => updateQuestionField(index, 'explanation', val)} />
          </View>
        ))}

        <TouchableOpacity style={styles.outlineBtn} onPress={addQuestionSlot}>
          <Ionicons name="add-circle-outline" size={18} color="#2563eb" />
          <Text style={styles.outlineBtnText}>Tambah Butir Soal Lain</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Simpan Paket Bank Soal</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// HALAMAN 7: SAMPAH / BARU DIHAPUS (RESTORE & HAPUS PERMANEN)
// ==========================================
function TrashScreen() {
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' | 'qbanks'
  const [trashedModules, setTrashedModules] = useState([]);
  const [trashedQBanks, setTrashedQBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = useCallback(async () => {
    setLoading(true);
    const modFallback = FALLBACK_MODULES.filter(m => Boolean(m.deletedAt));
    const qbFallback = FALLBACK_QBANKS.filter(q => Boolean(q.deletedAt));

    const [modData, qbData] = await Promise.all([
      safeFetchJson(`${API_BASE}/modules/trash`, modFallback),
      safeFetchJson(`${API_BASE}/question-banks/trash`, qbFallback)
    ]);

    setTrashedModules([...modData]);
    setTrashedQBanks([...qbData]);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrash();
    }, [loadTrash])
  );

  const handleRestore = async (type, item) => {
    const endpoint = type === 'modules' ? 'modules' : 'question-banks';
    const fallbackArr = type === 'modules' ? FALLBACK_MODULES : FALLBACK_QBANKS;

    const res = await restoreResource(endpoint, item.id, fallbackArr);
    if (type === 'modules') {
      setTrashedModules(prev => prev.filter(m => m.id !== item.id));
    } else {
      setTrashedQBanks(prev => prev.filter(q => q.id !== item.id));
    }

    showNotice(
      'Berhasil Dipulihkan',
      res.online
        ? `"${item.title}" telah dikembalikan ke daftar utama.`
        : `"${item.title}" dikembalikan ke daftar utama (Mode Offline).`
    );
  };

  const handlePermanentDelete = (type, item) => {
    const endpoint = type === 'modules' ? 'modules' : 'question-banks';
    const fallbackArr = type === 'modules' ? FALLBACK_MODULES : FALLBACK_QBANKS;

    confirmAction(
      'Hapus Permanen?',
      `"${item.title}" akan dihapus selamanya dan tidak dapat dipulihkan lagi.`,
      async () => {
        await permanentDeleteResource(endpoint, item.id, fallbackArr);
        if (type === 'modules') {
          setTrashedModules(prev => prev.filter(m => m.id !== item.id));
        } else {
          setTrashedQBanks(prev => prev.filter(q => q.id !== item.id));
        }
        showNotice('Dihapus Permanen', `"${item.title}" telah dihapus selamanya.`);
      },
      'Hapus Permanen'
    );
  };

  const currentData = activeTab === 'modules' ? trashedModules : trashedQBanks;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={18} color="#1e40af" />
        <Text style={styles.infoBannerText}>
          Data yang dihapus tersimpan di sini. Pilih Pulihkan untuk mengembalikan atau Hapus Permanen.
        </Text>
      </View>

      {/* Switcher Modul Ajar / Bank Soal */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'modules' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('modules')}
        >
          <Text style={[styles.segmentText, activeTab === 'modules' && styles.segmentTextActive]}>
            Modul Ajar ({trashedModules.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'qbanks' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('qbanks')}
        >
          <Text style={[styles.segmentText, activeTab === 'qbanks' && styles.segmentTextActive]}>
            Bank Soal ({trashedQBanks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="trash-bin-outline" size={44} color="#94a3b8" />
              <Text style={styles.emptyText}>
                Sampah {activeTab === 'modules' ? 'Modul Ajar' : 'Bank Soal'} masih kosong.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.subject} • {item.phase}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.deletedTimeText}>
                Dihapus: {formatDeletedTime(item.deletedAt)}
              </Text>

              <View style={styles.trashActionRow}>
                <TouchableOpacity
                  style={styles.restoreBtn}
                  onPress={() => handleRestore(activeTab, item)}
                >
                  <Ionicons name="refresh-outline" size={16} color="#fff" />
                  <Text style={styles.smallBtnText}>Pulihkan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.permDeleteBtn}
                  onPress={() => handlePermanentDelete(activeTab, item)}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#fff" />
                  <Text style={styles.smallBtnText}>Hapus Permanen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ==========================================
// HALAMAN 8: PROFILE / ABOUT APLIKASI
// ==========================================
function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.detailBox}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Tugas Akhir PPB 2026</Text>
        </View>
        <Text style={styles.detailTitle}>EduBank Mobile</Text>
        <Text style={styles.bodyText}>
          Sistem Katalog Modul Pembelajaran dan Bank Soal Kurikulum Merdeka berbasis React Native dan Custom REST API PostgreSQL Supabase.
        </Text>

        <Text style={styles.sectionLabel}>IDENTITAS PENGEMBANG</Text>
        <Text style={styles.listItem}>• Nama: Alif Rizki Kurniawan Hariadi</Text>
        <Text style={styles.listItem}>• NIM: 21120124140148</Text>
        <Text style={styles.listItem}>• Prodi: Teknik Komputer - Universitas Diponegoro</Text>

        <Text style={styles.sectionLabel}>SPESIFIKASI APLIKASI</Text>
        <Text style={styles.listItem}>• Platform: React Native (Expo APK Build)</Text>
        <Text style={styles.listItem}>• Backend: Express.js + Supabase (Full CRUD + Soft Delete & Restore)</Text>
        <Text style={styles.listItem}>• Navigasi: Bottom Navigation Bar + Stack (8 Halaman)</Text>
      </View>
    </ScrollView>
  );
}

function ModulStackScreen() {
  return (
    <ModulStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1d4ed8' }, headerTintColor: '#fff' }}>
      <ModulStack.Screen name="ModuleList" component={ModuleListScreen} options={{ title: 'Katalog Modul Ajar' }} />
      <ModulStack.Screen name="ModuleDetail" component={ModuleDetailScreen} options={{ title: 'Detail Modul Ajar' }} />
      <ModulStack.Screen name="AddModule" component={AddModuleScreen} options={{ title: 'Tambah Modul Ajar' }} />
    </ModulStack.Navigator>
  );
}

function SoalStackScreen() {
  return (
    <SoalStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1d4ed8' }, headerTintColor: '#fff' }}>
      <SoalStack.Screen name="QBankList" component={QBankListScreen} options={{ title: 'Repositori Bank Soal' }} />
      <SoalStack.Screen name="QBankDetail" component={QBankDetailScreen} options={{ title: 'Butir & Pembahasan Soal' }} />
      <SoalStack.Screen name="AddQBank" component={AddQBankScreen} options={{ title: 'Buat Paket Bank Soal' }} />
    </SoalStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#1d4ed8" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: route.name === 'Trash' || route.name === 'Profile',
            headerStyle: { backgroundColor: '#1d4ed8' },
            headerTintColor: '#fff',
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#64748b',
            tabBarIcon: ({ color, size }) => {
              let iconName = 'book-outline';
              if (route.name === 'ModulTab') iconName = 'library-outline';
              if (route.name === 'SoalTab') iconName = 'document-text-outline';
              if (route.name === 'Trash') iconName = 'trash-outline';
              if (route.name === 'Profile') iconName = 'person-circle-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="ModulTab" component={ModulStackScreen} options={{ title: 'Modul Ajar' }} />
          <Tab.Screen name="SoalTab" component={SoalStackScreen} options={{ title: 'Bank Soal' }} />
          <Tab.Screen name="Trash" component={TrashScreen} options={{ title: 'Sampah' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', marginTop: 48, paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 12, fontSize: 14 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  iconGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconActionBtn: { padding: 4 },
  badge: { backgroundColor: '#dbeafe', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#1e40af', fontSize: 12, fontWeight: '700' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4, marginTop: 6 },
  cardDesc: { fontSize: 13, color: '#475569', lineHeight: 18 },
  deletedTimeText: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 12 },
  detailBox: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 14, elevation: 1 },
  detailTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 6, marginTop: 6 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginTop: 14, marginBottom: 6 },
  bodyText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  listItem: { fontSize: 14, color: '#1e293b', marginBottom: 4, lineHeight: 20 },
  questionCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  questionStem: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 10, marginTop: 8 },
  optionBox: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  optionText: { fontSize: 13, color: '#334155' },
  answerBox: { backgroundColor: '#ecfdf5', padding: 12, borderRadius: 8, marginTop: 8, borderLeftWidth: 4, borderLeftColor: '#10b981' },
  answerTitle: { fontSize: 13, fontWeight: '700', color: '#065f46', marginBottom: 4 },
  answerExp: { fontSize: 13, color: '#047857', lineHeight: 18 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a'
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  outlineBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 4
  },
  outlineBtnText: { color: '#2563eb', fontSize: 14, fontWeight: '700' },
  editBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#d97706',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10
  },
  deleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 10
  },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dbeafe',
    margin: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10
  },
  infoBannerText: { flex: 1, fontSize: 12, color: '#1e3a8a', lineHeight: 17 },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 4
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center'
  },
  segmentBtnActive: { backgroundColor: '#2563eb' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  segmentTextActive: { color: '#fff' },
  trashActionRow: { flexDirection: 'row', gap: 10 },
  restoreBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8
  },
  permDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 8
  },
  smallBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' }
});