import Prism from 'prismjs';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-diff.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-toml.js';
import 'prismjs/plugins/custom-class/prism-custom-class.js';
import 'prismjs/plugins/diff-highlight/prism-diff-highlight.js';

Prism.plugins.customClass.prefix('prism-');

Prism.languages.cpp.keyword = [
  Prism.languages.cpp.keyword,
  /\b(u8|u16|u32|u64|s8|s16|s32|s64|uint)\b/,
];

Prism.languages.armv4t = {
  comment: {
    pattern: /;.*/,
    greedy: true,
  },
  function:
    /\b(lsl|asr|lsr|ror|bx|b|bl|and|eor|sub|sbc|rsb|add|adc|sbc|rsc|tst|teq|cmp|cmn|orr|mov|bic|mvn|mrs|msr|mla|mul|umull|mulal|smull|smlal|ldr|ldrb|ldrh|str|strb|strh|ldrsb|ldrsh|ldmed|ldmea|ldmfd|ldmfa|stmed|stmea|stmfd|stmfa|swp|swpb|push|pop)s?(eq|ne|cs|cc|mi|pl|vs|vc|hi|ls|ge|lt|gt|le|al|nv)?\b/,
  keyword: /\b(r0|r1|r2|r3|r4|r5|r6|r7|r8|r9|r10|r11|r12|r13|r14|r15|pc|lr|sp)\b/,
  number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
};

Prism.languages.drizzle = {
  comment: {
    pattern: /(^|[^\\])#.*/,
    lookbehind: true,
  },
  'triple-quoted-string': {
    pattern: /(?:[rub]|br|rb)?(""")[\s\S]*?\1/i,
    greedy: true,
    alias: 'string',
  },
  string: {
    pattern: /(?:[rub]|br|rb)?(")(?:\\.|(?!\1)[^\\\r\n])*\1/i,
    greedy: true,
  },
  function: {
    pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
    lookbehind: true,
  },
  'class-name': {
    pattern: /(\bclass\s+)\w+/i,
    lookbehind: true,
  },
  keyword:
    /\b(block|break|class|case|continue|def|default|elif|else|false|for|if|in|noop|null|return|switch|this|true|var|while)\b/,
  builtin: /\b(assert|len|print|read_bin|sdl_events|sdl_keystate|sdl_window|time)\b/,
  boolean: /\b(?:false|null|true)\b/,
  number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
  operator: /\.\.|[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
  punctuation: /[{}[\];(),.:]/,
};

Prism.hooks.add('complete', ({ element }) => {
  element.parentNode.removeAttribute('tabindex');
});

export default Prism;
