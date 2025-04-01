<!-- 经典布局 -->
<template>
    <el-container class="layout">
        <el-header style="position: absolute;"></el-header>
        <el-container class="layout-content">
            <el-container class="layout-main">
                <router-view></router-view>
            </el-container>
        </el-container>
    </el-container>
</template>

<script setup lang="ts" name="layout"></script>
<style scoped lang="scss">
.layout {
    &-content {
        
    }

    &-main {
    
    }
}
</style>
