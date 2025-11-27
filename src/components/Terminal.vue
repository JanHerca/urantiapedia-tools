<template>
  <QCard dark class="terminal-card">
    <QScrollArea class="terminal-output-area" ref="scrollAreaRef">
      <div 
        class="fit"
        v-for="(log, index) in logs" 
        :key="index" 
        :class="['log-line', `log-type-${log.type}`]"
      >
        <span class="timestamp">[{{ log.time }}]</span>
        <span class="message">{{ log.message }}</span>
      </div>
    </QScrollArea>
  </QCard>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { QCard, QScrollArea } from 'quasar';

//Props
const props = defineProps({
  logs: {
    type: Array,
    required: true,
  },
});

//State
const scrollAreaRef = ref(null);

//Watchers
watch(props.logs, () => {
  nextTick(() => {
    if (scrollAreaRef.value) {
      scrollAreaRef.value.setScrollPercentage('vertical', 1);
    }
  });
}, { deep: true });
</script>

<style scoped>
.terminal-card {
  position: relative;
  background-color: #1e1e1e !important;
  color: #cccccc;
  border-radius: 4px;
  border: 1px solid #333;
  height: fit-content;
  min-height: 0;
  width: 100%;
}
.terminal-output-area {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 8px;
}
.log-line {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  line-height: 1.5;
  white-space: pre-wrap;
}
.timestamp {
  color: #777777;
  margin-right: 8px;
  user-select: none;
}
.log-type-log .message {
  color: #ffffff;
}
.log-type-warning .message {
  color: #ffcc00;
  font-weight: bold;
}
.log-type-error .message {
  color: #ff4444;
  font-weight: bold;
}
</style>