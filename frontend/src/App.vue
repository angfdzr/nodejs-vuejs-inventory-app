<script setup>
import { ref, computed } from "vue";
import { RouterView, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { ArrowDown, Menu as MenuIcon, Close } from "@element-plus/icons-vue";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const menuOpen = ref(false);

const initials = computed(() => {
    const name = authStore.user?.nama || "";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
});

const isGroupActive = (paths) => paths.some((p) => route.path.startsWith(p));

const handleLogout = async () => {
    await authStore.logout();
    menuOpen.value = false;
    router.push("/login");
};

const closeMenu = () => (menuOpen.value = false);
</script>

<template>
    <div class="app-wrapper">
        <nav v-if="authStore.user" class="navbar">
            <div class="navbar-inner">
                <div class="navbar-top">
                    <router-link to="/" class="navbar-brand" @click="closeMenu">
                        <span class="brand-mark">VTS</span>
                        <span class="brand-text">Inventaris VTS Merak</span>
                    </router-link>

                    <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Menu">
                        <el-icon :size="20">
                            <MenuIcon v-if="!menuOpen" />
                            <Close v-else />
                        </el-icon>
                    </button>
                </div>

                <div class="navbar-menu" :class="{ 'is-open': menuOpen }">
                    <router-link to="/" class="nav-link" @click="closeMenu">Dashboard</router-link>

                    <div class="nav-group"
                        :class="{ active: isGroupActive(['/barang', '/kategori', '/lokasi', '/supplier']) }">
                        <span class="nav-link nav-group-label">
                            Data Master <el-icon class="caret">
                                <ArrowDown />
                            </el-icon>
                        </span>
                        <div class="nav-dropdown">
                            <router-link to="/barang" @click="closeMenu">Barang</router-link>
                            <router-link to="/kategori" @click="closeMenu">Kategori</router-link>
                            <router-link to="/lokasi" @click="closeMenu">Lokasi</router-link>
                            <router-link to="/supplier" @click="closeMenu">Supplier</router-link>
                        </div>
                    </div>

                    <div class="nav-group"
                        :class="{ active: isGroupActive(['/nota-pembelian', '/transaksi-keluar']) }">
                        <span class="nav-link nav-group-label">
                            Transaksi <el-icon class="caret">
                                <ArrowDown />
                            </el-icon>
                        </span>
                        <div class="nav-dropdown">
                            <router-link to="/nota-pembelian" @click="closeMenu">Nota Pembelian</router-link>
                            <router-link to="/transaksi-keluar" @click="closeMenu">Barang Keluar</router-link>
                        </div>
                    </div>

                    <router-link to="/laporan-barang" class="nav-link" @click="closeMenu">Laporan Barang</router-link>
                    <router-link to="/laporan-pembelian" class="nav-link" @click="closeMenu">Laporan
                        Pembelian</router-link>

                    <div class="navbar-user">
                        <div class="user-avatar">{{ initials }}</div>
                        <div class="user-info">
                            <span class="user-name">{{ authStore.user.nama }}</span>
                            <span class="user-role">{{ authStore.user.role }}</span>
                        </div>
                        <el-button size="small" @click="handleLogout">Logout</el-button>
                    </div>
                </div>
            </div>
        </nav>
        <main class="content">
            <RouterView />
        </main>
    </div>
</template>

<style scoped>
.navbar {
    background: #1f2937;
    color: white;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.navbar-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
}

.navbar-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: white;
}

.brand-mark {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
}

.brand-text {
    font-weight: 600;
    font-size: 15px;
    white-space: nowrap;
}

.hamburger {
    display: none;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 6px;
}

.navbar-menu {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 48px;
}

.nav-link {
    color: #d1d5db;
    text-decoration: none;
    font-size: 14px;
    padding: 0 14px;
    height: 48px;
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    transition: color 0.15s;
}

.nav-link:hover {
    color: white;
}

.nav-link.router-link-exact-active {
    color: #60a5fa;
    font-weight: 500;
}

.nav-link.router-link-exact-active::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 14px;
    right: 14px;
    height: 2px;
    background: #60a5fa;
    border-radius: 2px 2px 0 0;
}

.nav-group {
    position: relative;
    height: 48px;
}

.nav-group.active>.nav-group-label {
    color: #60a5fa;
    font-weight: 500;
}

.nav-group.active::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 14px;
    right: 14px;
    height: 2px;
    background: #60a5fa;
    border-radius: 2px 2px 0 0;
}

.caret {
    font-size: 11px;
    margin-left: 4px;
    transition: transform 0.15s;
}

.nav-group:hover .caret {
    transform: rotate(180deg);
}

.nav-dropdown {
    display: none;
    position: absolute;
    top: 48px;
    left: 0;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 6px;
    min-width: 170px;
    flex-direction: column;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.nav-group:hover .nav-dropdown {
    display: flex;
}

.nav-dropdown a {
    color: #d1d5db;
    text-decoration: none;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 6px;
    transition: background 0.15s;
}

.nav-dropdown a:hover {
    background: #374151;
    color: white;
}

.nav-dropdown a.router-link-exact-active {
    color: #60a5fa;
}

.navbar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    padding-left: 14px;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #4b5563;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
}

.user-info {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
}

.user-name {
    font-size: 13px;
    font-weight: 500;
    color: white;
}

.user-role {
    font-size: 11px;
    color: #9ca3af;
    text-transform: capitalize;
}

.content {
    padding: 28px 24px;
    max-width: 1280px;
    margin: 0 auto;
}

@media (max-width: 900px) {
    .hamburger {
        display: flex;
    }

    .navbar-inner {
        padding: 0 16px;
    }

    .navbar-menu {
        display: none;
        flex-direction: column;
        align-items: stretch;
        height: auto;
        gap: 0;
        padding-bottom: 12px;
    }

    .navbar-menu.is-open {
        display: flex;
    }

    .nav-link {
        height: auto;
        padding: 12px 4px;
        border-bottom: 1px solid #374151;
    }

    .nav-link.router-link-exact-active::after {
        display: none;
    }

    .nav-group {
        height: auto;
        border-bottom: 1px solid #374151;
    }

    .nav-group.active::after {
        display: none;
    }

    .nav-group-label {
        border-bottom: none;
        justify-content: space-between;
    }

    .nav-dropdown {
        display: flex;
        position: static;
        border: none;
        box-shadow: none;
        padding: 0 0 8px 12px;
    }

    .navbar-user {
        margin-left: 0;
        margin-top: 12px;
        padding-left: 0;
        justify-content: space-between;
    }

    .content {
        padding: 16px;
    }
}
</style>