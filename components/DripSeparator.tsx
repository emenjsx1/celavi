interface DripSeparatorProps {
  topColor?: string
  bottomColor?: string
  height?: string
  className?: string
}

export default function DripSeparator({ 
  topColor = 'bg-black-dark', 
  bottomColor = 'bg-white',
  height = 'h-12',
  className = ''
}: DripSeparatorProps) {
  // Determina a cor hexadecimal baseada na classe Tailwind
  const getColor = (colorClass: string) => {
    if (colorClass === 'bg-black-dark') return '#1A1A1A'
    if (colorClass === 'bg-red-strong') return '#E10600'
    if (colorClass === 'bg-red-dark') return '#700F12'
    if (colorClass === 'bg-white') return '#FFFFFF'
    return '#1A1A1A'
  }

  const topColorHex = getColor(topColor)
  const bottomColorHex = getColor(bottomColor)

  return (
    <div className={`relative w-full ${height} ${className}`} style={{ backgroundColor: topColorHex }}>
      {/* SVG com efeito de gotejamentos orgânicos */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ height: '100%' }}
      >
        {/* Linha base irregular com ondulações - sempre na cor do topo */}
        <path
          d="M0,0 L0,50 Q25,55 50,50 Q75,48 100,52 Q125,50 150,48 Q175,52 200,50 Q225,48 250,51 Q275,49 300,52 Q325,50 350,48 Q375,51 400,49 Q425,52 450,50 Q475,48 500,51 Q525,49 550,52 Q575,50 600,48 Q625,51 650,49 Q675,52 700,50 Q725,48 750,51 Q775,49 800,52 Q825,50 850,48 Q875,51 900,49 Q925,52 950,50 Q975,48 1000,51 Q1025,49 1050,52 Q1075,50 1100,48 Q1125,51 1150,49 Q1175,52 1200,50 L1200,0 Z"
          fill={topColorHex}
        />
        {/* Gotejamentos individuais variados e orgânicos - sempre na cor do topo */}
        <path d="M20,50 Q22,75 25,100 Q28,75 30,50 Z" fill={topColorHex} />
        <path d="M70,50 Q73,85 77,110 Q80,85 83,50 Z" fill={topColorHex} />
        <path d="M120,50 Q122,68 125,88 Q128,68 130,50 Z" fill={topColorHex} />
        <path d="M170,50 Q173,82 177,105 Q180,82 183,50 Z" fill={topColorHex} />
        <path d="M220,50 Q222,72 225,95 Q228,72 230,50 Z" fill={topColorHex} />
        <path d="M270,50 Q273,88 277,112 Q280,88 283,50 Z" fill={topColorHex} />
        <path d="M320,50 Q322,66 325,90 Q328,66 330,50 Z" fill={topColorHex} />
        <path d="M370,50 Q373,80 377,102 Q380,80 383,50 Z" fill={topColorHex} />
        <path d="M420,50 Q422,74 425,98 Q428,74 430,50 Z" fill={topColorHex} />
        <path d="M470,50 Q473,86 477,108 Q480,86 483,50 Z" fill={topColorHex} />
        <path d="M520,50 Q522,70 525,92 Q528,70 530,50 Z" fill={topColorHex} />
        <path d="M570,50 Q573,84 577,106 Q580,84 583,50 Z" fill={topColorHex} />
        <path d="M620,50 Q622,76 625,100 Q628,76 630,50 Z" fill={topColorHex} />
        <path d="M670,50 Q673,82 677,104 Q680,82 683,50 Z" fill={topColorHex} />
        <path d="M720,50 Q722,64 725,87 Q728,64 730,50 Z" fill={topColorHex} />
        <path d="M770,50 Q773,78 777,100 Q780,78 783,50 Z" fill={topColorHex} />
        <path d="M820,50 Q822,72 825,94 Q828,72 830,50 Z" fill={topColorHex} />
        <path d="M870,50 Q873,86 877,110 Q880,86 883,50 Z" fill={topColorHex} />
        <path d="M920,50 Q922,68 925,91 Q928,68 930,50 Z" fill={topColorHex} />
        <path d="M970,50 Q973,80 977,103 Q980,80 983,50 Z" fill={topColorHex} />
        <path d="M1020,50 Q1022,74 1025,97 Q1028,74 1030,50 Z" fill={topColorHex} />
        <path d="M1070,50 Q1073,88 1077,111 Q1080,88 1083,50 Z" fill={topColorHex} />
        <path d="M1120,50 Q1122,66 1125,89 Q1128,66 1130,50 Z" fill={topColorHex} />
        <path d="M1170,50 Q1173,82 1177,105 Q1180,82 1183,50 Z" fill={topColorHex} />
      </svg>
    </div>
  )
}

