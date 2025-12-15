<template>
  <q-card dark class="terminal-card">
    <div class="row full-width">
      <div class="col-12 q-pa-sm">
        <q-list 
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
            <template v-if="log.type !== 'table'">
              <span class="timestamp">[{{ log.time }}]</span>
              <span class="message">{{ log.message }}</span>
              <q-expansion-item
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
              </q-expansion-item>
            </template>
    
            <div v-else class="table-container">
              <q-table
                v-if="log.table"
                :rows="log.table"
                :title="log.message"
                row-key="name"
                dense
                :rows-per-page-options="[0]"
                hide-pagination
                :class="['terminal-table', 'q-mt-sm']"
              >
                <template v-slot:body-cell="props">
                  <q-td :props="props" class="terminal-table-cell">
                    {{ props.value }}
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
        </q-list>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

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
// watch(props.logs, () => {
//   nextTick(() => {
//     if (scrollAreaRef.value) {
//       scrollAreaRef.value.setScrollPercentage('vertical', 1);
//     }
//   });
// }, { deep: true });
</script>

<style scoped>
.terminal-card {
  background-color: #1e1e1e !important;
  color: #cccccc;
  border-radius: 4px;
  border: 1px solid #333;
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
.table-container {
  padding-bottom: 8px;
  padding-right: 12px;
}
.terminal-table {
  background-color: #252526;
  border: 1px solid #333;
  border-radius: 4px;
}
.terminal-table :deep(.q-table__container) {
  background-color: transparent;
  color: #ffffff;
}
.terminal-table :deep(.q-table tbody td) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  line-height: 1.5;
  padding: 4px 8px;
  border-color: #333;
}
.terminal-table-cell {
  color: #ffffff !important;
}
.log-type-table .message {
  color: #027be3;
}
</style>