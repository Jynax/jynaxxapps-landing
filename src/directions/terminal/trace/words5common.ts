// Common 5-letter English words — used by the puzzle integrity gate to verify
// that every word on the BFS shortest path is recognisably common.
// Not used during gameplay: submitWord uses the full WORD_SET for leniency.
//
// Puzzle authors: before adding a new entry, run
//   bfsShortestPath(start, target, COMMON_WORD_SET)?.length - 1 === par
// in the test suite (trace-puzzles.spec.ts) to confirm a common-word path
// exists with the declared par.

const WORDS: string[] = [
  // a
  'about','above','abuse','actor','acute','admit','adopt','adult','after',
  'again','agree','ahead','alarm','alert','alike','alive','aloft','alone',
  'alter','angel','anger','angle','angry','apart','apple','apply','arise',
  'armed','armor','array','aside','avoid','awake','aware',
  // b
  'badly','baker','based','basic','basis','beach','begin','being','below',
  'bench','birth','black','blame','bland','blank','blaze','bleed','blend',
  'block','bloom','blown','blues','blunt','board','boost','bound','boxer',
  'braid','brain','brand','brave','break','breed','brine','brink','brisk',
  'bring','broke','brown','build','burst',
  // c
  'cable','candy','carry','catch','cause','chair','chaos','charm','chart',
  'chase','cheap','chest','chief','child','chunk','civic','civil','claim',
  'class','clean','clear','clerk','click','cliff','climb','clock','close',
  'cloud','cobra','color','craft','crane','crash','crazy','crisp','cross',
  'crowd','crush','curve','cycle',
  // d
  'daily','dance','death','decay','depth','diary','doubt','dough','dread',
  'drift','drink','drive','drone','dwarf','dwell',
  // e
  'eager','early','eight','elbow','elect','elite','ember','empty','enemy',
  'enjoy','enter','equal','erase','error','event','every','exact','exist',
  'extra',
  // f
  'faint','faith','false','fancy','fault','feast','field','fight','final',
  'first','flame','flash','flesh','float','flood','focus','force','forge',
  'forth','found','frame','fraud','fresh','front','frost','fruit','funny',
  // g
  'ghost','given','glass','glaze','globe','gloom','glory','gloss','glove',
  'goods','grace','grade','grain','grand','graph','grass','grave','graze',
  'great','greed','green','greet','grief','grind','groan','groin','grove',
  'guard','guess','guest','guide','guild','guilt','gusto',
  // h
  'happy','harsh','heart','heavy','hedge','herbs','honey','horse','hotel',
  'house','hover','human','humid','humor','hurry',
  // i
  'image','index','inner','input','issue','ivory',
  // j
  'joint','joker','judge','juice','jumbo',
  // k
  'karma','knife','knock',
  // l
  'label','lance','large','laser','later','latch','laugh','layer','learn',
  'lease','leave','legal','light','liner','liver','local','lodge','loose',
  'lower','loyal','lucid','lucky',
  // m
  'magic','major','maker','manor','march','marsh','match','mayor','media',
  'merge','might','mills','mixed','model','month','moral','motto','mouse',
  'moves','music',
  // n
  'naive','never','night','noble','noise','north','noted','novel','nurse',
  // o
  'occur','offer','often','olive','onset','orbit','order','organ','other',
  'outer',
  // p
  'panel','panic','paper','party','patch','pause','peace','pearl','phase',
  'pilot','pitch','place','plain','plane','plant','plate','plaza','point',
  'polar','power','press','prize','probe','proud','pulse','punch','purge',
  // q
  'queen','query','quest','quite','quota','quote',
  // r
  'radio','range','rapid','reach','realm','rebel','refer','relax','reset',
  'rider','rifle','right','rigid','rival','river','rocky','rough','round',
  'royal','ruler','rural',
  // s
  'saint','sauce','scale','scare','scene','scone','scope','score','scout',
  'shade','shale','shall','shame','shape','share','shark','sharp','shone',
  'shore','short','shout','sight','since','skill','slave','sleep','slice',
  'slide','slope','sloth','smart','smell','smile','smoke','snake','snare',
  'snore','solar','solid','solve','south','space','spare','spark','speak',
  'spell','spend','spice','split','sport','stale','stalk','stand','stare',
  'stark','start','state','steam','steep','steer','stern','stick','still',
  'stoic','stone','store','storm','stuck','study','style','sugar','suite',
  'super','surge','swamp','swear','sweat','sweet','swift','swore','sworn',
  // t
  'table','talon','taste','teach','teeth','tempo','tense','thick','thing',
  'think','thorn','three','thumb','tight','timer','tired','titan','today',
  'token','topic','total','touch','towel','toxic','trace','trade','trail',
  'train','trash','treat','trend','trial','tribe','trick','troop','trust',
  'truth','twist',
  // u
  'ultra','uncle','under','union','unity','until','upper','urban','usage',
  'usual','utter',
  // v
  'valor','value','video','vital','vocal','voice',
  // w
  'waist','watch','waste','water','weird','while','white','whole','wider',
  'witch','women','world','worry','wound','wrath',
  // y
  'yield','young','youth',
  // z
  'zebra',
];

export const COMMON_WORD_SET: ReadonlySet<string> = new Set(WORDS);
