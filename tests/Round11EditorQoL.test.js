import { describe, it, expect } from 'vitest';
import { processEditorKeyPress } from '../src/components/computer/EditorTab';

describe('Round 11 — GÖREV GRUBU 2: IDE Yazım Kolaylıkları (Otomatik Kapanan Tırnak/Parantez)', () => {
  it('Açılış parantezi yazıldığında otomatik kapanan parantez ekler ve imleci ortaya yerleştirir', () => {
    // ( tuşuna basıldığında
    const res1 = processEditorKeyPress('const a = ', 10, 10, '(');
    expect(res1.handled).toBe(true);
    expect(res1.newContent).toBe('const a = ()');
    expect(res1.newStart).toBe(11);
    expect(res1.newEnd).toBe(11);

    // [ tuşuna basıldığında
    const res2 = processEditorKeyPress('const arr = ', 12, 12, '[');
    expect(res2.handled).toBe(true);
    expect(res2.newContent).toBe('const arr = []');
    expect(res2.newStart).toBe(13);

    // { tuşuna basıldığında
    const res3 = processEditorKeyPress('function test', 13, 13, '{');
    expect(res3.handled).toBe(true);
    expect(res3.newContent).toBe('function test{}');
    expect(res3.newStart).toBe(14);
  });

  it('Tırnak karakterleri yazıldığında otomatik çift oluşturur', () => {
    // Çift tırnak "
    const res1 = processEditorKeyPress('const s = ', 10, 10, '"');
    expect(res1.handled).toBe(true);
    expect(res1.newContent).toBe('const s = ""');
    expect(res1.newStart).toBe(11);

    // Tek tırnak '
    const res2 = processEditorKeyPress('const s = ', 10, 10, "'");
    expect(res2.handled).toBe(true);
    expect(res2.newContent).toBe("const s = ''");
    expect(res2.newStart).toBe(11);

    // Backtick `
    const res3 = processEditorKeyPress('const s = ', 10, 10, '`');
    expect(res3.handled).toBe(true);
    expect(res3.newContent).toBe('const s = ``');
    expect(res3.newStart).toBe(11);
  });

  it('Metin seçiliyken parantez veya tırnak basıldığında seçili metni sarar (autoSurround)', () => {
    const code = 'hello world';
    // 'world' kelimesi seçili (indeks 6 to 11)
    const res = processEditorKeyPress(code, 6, 11, '(');
    expect(res.handled).toBe(true);
    expect(res.newContent).toBe('hello (world)');
    expect(res.newStart).toBe(7);
  });

  it('Type-Over: Önceden kapanmış parantez/tırnak önünde kapanış karakteri girilirse atlar', () => {
    const code = 'const s = ""';
    // İmleç tam iki tırnak arasında (indeks 11): 'const s = "' | '"'
    const res = processEditorKeyPress(code, 11, 11, '"');
    expect(res.handled).toBe(true);
    expect(res.type).toBe('type_over');
    expect(res.newContent).toBe(code); // İçerik değişmedi, çift tırnak eklenmedi
    expect(res.newStart).toBe(12); // İmleç tırnağın sağına geçti

    const parenCode = 'calc()';
    // İmleç parantez içinde (indeks 5)
    const res2 = processEditorKeyPress(parenCode, 5, 5, ')');
    expect(res2.handled).toBe(true);
    expect(res2.newContent).toBe(parenCode);
    expect(res2.newStart).toBe(6);
  });

  it('Backspace ile boş parantez veya tırnak çiftini tek hamlede siler', () => {
    const code = 'calc()';
    // İmleç tam () arasında (indeks 5)
    const res = processEditorKeyPress(code, 5, 5, 'Backspace');
    expect(res.handled).toBe(true);
    expect(res.type).toBe('delete_pair');
    expect(res.newContent).toBe('calc');
    expect(res.newStart).toBe(4);

    const quotes = 'str = ""';
    // İmleç "" arasında (indeks 7)
    const res2 = processEditorKeyPress(quotes, 7, 7, 'Backspace');
    expect(res2.handled).toBe(true);
    expect(res2.newContent).toBe('str = ');
    expect(res2.newStart).toBe(6);
  });

  it('Tab tuşu ile 2 boşluk girinti (indentation) sağlar', () => {
    const code = 'function test() {\n';
    const res = processEditorKeyPress(code, 18, 18, 'Tab');
    expect(res.handled).toBe(true);
    expect(res.newContent).toBe('function test() {\n  ');
    expect(res.newStart).toBe(20);
  });
});
