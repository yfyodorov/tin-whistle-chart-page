const FINGERING = {
    'D4': '111111', 'E4': '111110', 'F#4': '111100', 'G4': '111000',
    'A4': '110000', 'B4': '100000', 'C4': '011000',
    'C5': '011000', 'C#5': '000000', 'D5': '111111', 'E5': '111110',
    'F#5': '111100', 'G5': '111000', 'A5': '110000', 'B5': '100000',
    'C6': '000000', 'C#6': '000000', 'D6': '111111'
  };

  function isOverblown(note) {
    const match = note.match(/\d/);
    return match && parseInt(match[0]) >= 5;
  }

  function formatNoteLabel(note) {
    const match = note.match(/^([A-Ga-g#b]+)(\d)$/);
    if (!match) return note;
    const [, name, octave] = match;
    return parseInt(octave) <= 4 ? name.toLowerCase() : name.toUpperCase();
  }

  function drawDiagram(note, fingering) {
    const container = document.createElement('div');
    container.className = 'diagram';

    const label = document.createElement('div');
    label.className = 'note-label';
    label.textContent = formatNoteLabel(note);
    container.appendChild(label);

    const overblownMark = document.createElement('div');
    if (isOverblown(note)) {
      overblownMark.className = 'overblown';
      overblownMark.textContent = '+'; 
    } else {
      //overblownMark.textContent = ' ';
      overblownMark.innerHTML = '&nbsp;';
    }
    container.appendChild(overblownMark);

    for (let i = 0; i < 6; i++) {
      const hole = document.createElement('div');
      hole.className = 'circle';
      if (fingering[i] === '1') hole.classList.add('filled');
      container.appendChild(hole);
    }

    return container;
  }

  function drawEmpty() {
    const container = document.createElement('div');
    container.className = 'diagram-empty';
    const nbsp = '      ';

    const label = document.createElement('div');
    label.className = 'note-label';
    label.textContent = nbsp;
    container.appendChild(label);

    const overblownMark = document.createElement('div');
    overblownMark.textContent = nbsp;
    container.appendChild(overblownMark);

    for (let i = 0; i < 6; i++) {
      const hole = document.createElement('div');
      hole.textContent = nbsp;
      container.appendChild(hole);
    }

    return container;
  }

  function parseABCNotes(abcString) {
    const parsed = ABCJS.parseOnly(abcString);
    if (!parsed || !parsed.length) return [];

    const groups = []
    var notes = [];

    /*
    console.log(parsed);
    console.log(parsed[0]);
    console.log(parsed[0].lines);
    console.log(parsed[0].lines[0]);
    console.log(parsed[0].lines[0].staff);
    console.log(parsed[0].lines[0].staff[0]);
    console.log(parsed[0].lines[0].staff[0].voices);
    */

    voices = parsed[0].lines[0].staff[0].voices

    for (const element of voices[0]) {
        console.log("ELEM", element);
        if (element.el_type == "note" && element.pitches) {
          console.log("PITCHES", element.pitches);

          for (const pitch of element.pitches) {
            const step = pitch.pitch; // 0 = C, 1 = C#/Db, ..., 11 = B
            //const accidentals = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            //const noteName = accidentals[step % 12];
            noteName = pitch.name.toUpperCase();
            if(noteName[0] == '^') noteName = noteName.slice(1)+"#";
            const octave = Math.floor(pitch.pitch / 7) + 4;
            console.log(noteName + octave);
            notes.push(noteName + octave);
          }
        } else if(element.el_type == "bar") {
          groups.push(notes);
          notes = [];
        }
      }
    if (notes.length) groups.push(notes);
    return groups;
  }

  function groupNotes(notes, groupSize = 16) {
    const groups = [];
    for (let i = 0; i < notes.length; i += groupSize) {
      groups.push(notes.slice(i, i + groupSize));
    }
    return groups;
  }

  function generateCharts() {
    const abc = document.getElementById('abcInput').value;
    const groups = parseABCNotes(abc);
    //console.log(notes);
    //const groups = groupNotes(notes);
    console.log(groups);
    const output = document.getElementById('output');
    output.innerHTML = '';

    groups.forEach(group => {
      group.forEach(note => {
        const finger = FINGERING[note] || '000000';
        output.appendChild(drawDiagram(note, finger));
      });
      output.appendChild(drawEmpty());
    });
  }

  function downloadPNG() {
    html2canvas(document.getElementById('output')).then(canvas => {
      const link = document.createElement('a');
      link.download = 'tin_whistle_chart.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  function downloadPDF() {
    html2canvas(document.getElementById('output')).then(canvas => {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape' });
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 270, 180);
      pdf.save('tin_whistle_chart.pdf');
    });
  }