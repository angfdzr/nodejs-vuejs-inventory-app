<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getBarangById, createBarang, updateBarang } from "@/services/barangService";
import { getKategori } from "@/services/kategoriService";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const kategoriList = ref([]);

const form = ref({
    nama_barang: "",
    id_kategori: "",
    jenis_barang: "",
    satuan: "",
    stok_minimum: 0,
    stok_saat_ini: 0
});

const rules = {
    nama_barang: [{ required: true, message: "Nama barang wajib diisi", trigger: "blur" }],
    id_kategori: [{ required: true, message: "Kategori wajib dipilih", trigger: "change" }],
    jenis_barang: [{ required: true, message: "Jenis barang wajib dipilih", trigger: "change" }],
    satuan: [{ required: true, message: "Satuan wajib diisi", trigger: "blur" }]
};

const formRef = ref(null);

const fetchKategori = async () => {
    const res = await getKategori({ limit: 100 });
    kategoriList.value = res.data.data;
};

const fetchBarang = async () => {
    if (!isEdit.value) return;
    const res = await getBarangById(route.params.id);
    const data = res.data.data;
    form.value = {
        nama_barang: data.nama_barang,
        id_kategori: data.id_kategori,
        jenis_barang: data.jenis_barang,
        satuan: data.satuan,
        stok_minimum: data.stok_minimum,
        stok_saat_ini: data.stok_saat_ini
    };
};

const handleSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        if (isEdit.value) {
            await updateBarang(route.params.id, form.value);
            ElMessage.success("Barang berhasil diperbarui");
        } else {
            await createBarang(form.value);
            ElMessage.success("Barang berhasil ditambahkan");
        }
        router.push("/barang");
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "Gagal menyimpan barang");
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchKategori();
    fetchBarang();
});
</script>

<template>
    <div>
        <h2>{{ isEdit ? "Edit Barang" : "Tambah Barang" }}</h2>

        <el-card style="max-width: 500px; margin-top: 16px">
            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
                <el-form-item label="Nama barang" prop="nama_barang">
                    <el-input v-model="form.nama_barang" placeholder="Misal: Kain pel" />
                </el-form-item>

                <el-form-item label="Kategori" prop="id_kategori">
                    <el-select v-model="form.id_kategori" placeholder="Pilih kategori" style="width: 100%">
                        <el-option
                            v-for="kat in kategoriList"
                            :key="kat.id_kategori"
                            :label="kat.nama_kategori"
                            :value="kat.id_kategori"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="Jenis barang" prop="jenis_barang">
                    <el-select v-model="form.jenis_barang" placeholder="Pilih jenis" style="width: 100%">
                        <el-option label="Habis pakai" value="habis_pakai" />
                        <el-option label="Tidak habis pakai" value="tidak_habis_pakai" />
                    </el-select>
                </el-form-item>

                <el-form-item label="Satuan" prop="satuan">
                    <el-input v-model="form.satuan" placeholder="Misal: pcs, liter, unit" />
                </el-form-item>

                <el-form-item label="Stok minimum">
                    <el-input-number v-model="form.stok_minimum" :min="0" style="width: 100%" />
                </el-form-item>

                <el-form-item label="Stok saat ini">
                    <el-input-number v-model="form.stok_saat_ini" :min="0" style="width: 100%" />
                </el-form-item>

                <div class="form-actions">
                    <el-button @click="router.push('/barang')">Batal</el-button>
                    <el-button type="primary" :loading="loading" @click="handleSubmit">Simpan</el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
}
</style>