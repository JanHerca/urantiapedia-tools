<template>
  <QCard dark class="terminal-card">
    <QScrollArea 
      class="terminal-output-area" 
      ref="scrollAreaRef"
      :thumb-style="{
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '10px',
        opacity: 0.75
      }"
      :bar-style="{
        borderRadius: '9px',
        backgroundColor: '#027be3',
        width: '10px',
        opacity: 0.2
      }"
      >
      <div 
        class="fit"
        v-for="(log, index) in logs" 
        :key="index" 
        :class="['log-line', `log-type-${log.type}`]"
      >
        <span class="timestamp">[{{ log.time }}]</span>
        <span class="message">{{ log.message }}</span>
        <QExpansionItem
          v-if="log.type === 'error' && log.stack && log.stack.length > 0"
          dense
          switch-toggle-side
          label="Stack Trace"
          class="stack-trace-expansion"
        >
          <div class="stack-trace-content">
            <div 
              v-for="(line, lineIndex) in log.stack" 
              :key="lineIndex"
              class="stack-trace-line"
            >
              {{ line }}
            </div>
          </div>
        </QExpansionItem>
      </div>
    </QScrollArea>
  </QCard>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { QCard, QScrollArea, QExpansionItem } from 'quasar';

//Props
const props = defineProps({
  //Log array with:
  // { type: 'log'|'warning'|'error'|'success', time: string, message: string, stack?: string[] }
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
.log-type-success .message { 
  color: #37b737;
  font-weight: bold;
}
.stack-trace-expansion {
  padding-left: 20px;
  margin-top: -5px;
}
.stack-trace-expansion :deep(.q-item) { 
    min-height: 20px;
    padding: 0;
    color: #777777 !important;
}
.stack-trace-content {
  padding: 4px 0 4px 10px;
  background-color: #252526;
  border-left: 2px solid #333;
}
.stack-trace-line {
  font-size: 0.8em;
  color: #aaaaaa;
  line-height: 1.3;
}
</style>