function initArm() {
  Prism.languages.armv4t = {
    comment: {
      pattern: /;.*/,
      greedy: true
    },
    function: /\b(lsl|asr|lsr|ror|bx|b|bl|and|eor|sub|sbc|rsb|add|adc|sbc|rsc|tst|teq|cmp|cmn|orr|mov|bic|mvn|mrs|msr|mla|mul|umull|mulal|smull|smlal|ldr|ldrb|ldrh|str|strb|strh|ldrsb|ldrsh|ldmed|ldmea|ldmfd|ldmfa|stmed|stmea|stmfd|stmfa|swp|swpb|push|pop)s?(eq|ne|cs|cc|mi|pl|vs|vc|hi|ls|ge|lt|gt|le|al|nv)?\b/,
    keyword: /\b(r0|r1|r2|r3|r4|r5|r6|r7|r8|r9|r10|r11|r12|r13|r14|r15|pc|lr|sp)\b/,
    number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i
  };
}

function initCpp() {
  const keywords = Prism.languages.cpp.keyword.source.split('|');
  keywords.splice(1, 0, 'u8|u16|u32|u64|s8|s16|s32|s64|uint');
  Prism.languages.cpp.keyword = new RegExp(keywords.join('|'));
}

initArm();
initCpp();
