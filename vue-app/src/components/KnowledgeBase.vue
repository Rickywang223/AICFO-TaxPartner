<template>
  <div>
    <div class="page-header">
      <div>
        <h2 class="page-title">📚 知识库</h2>
        <p class="page-subtitle">管理智能体可引用的知识文件</p>
      </div>
      <a-button type="primary">📤 上传文件</a-button>
    </div>
    <a-card>
      <a-empty description="知识库功能即将接入" />
    </a-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.page-title { font-size: 20px; font-weight: 600; margin: 0; }
.page-subtitle { font-size: 13px; color: #8c8c8c; margin: 4px 0 0; }
</style>
