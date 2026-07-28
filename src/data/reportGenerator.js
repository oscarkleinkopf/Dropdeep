import { getCategoryByProductName } from './products.js';

export function generateDeepResearchReport(productName) {
  const categoryId = getCategoryByProductName(productName);
  const formattedName = productName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  // Base metrics dependent on category
  let baseCost = 8.5;
  let baseMultiplier = 3.0;
  let baseShipping = 7;
  
  if (categoryId === 'beauty') {
    baseCost = 4.5 + Math.random() * 6; // $4.5 - $10.5
    baseMultiplier = 4.0 + Math.random() * 1.5; // High margin 4x to 5.5x
    baseShipping = 8;
  } else if (categoryId === 'health') {
    baseCost = 6.0 + Math.random() * 8; // $6 - $14
    baseMultiplier = 3.5 + Math.random() * 1.5;
    baseShipping = 7;
  } else if (categoryId === 'tech') {
    baseCost = 15.0 + Math.random() * 25; // $15 - $40
    baseMultiplier = 2.2 + Math.random() * 0.8; // Lower margin percentage
    baseShipping = 9;
  } else if (categoryId === 'pet') {
    baseCost = 5.0 + Math.random() * 9;
    baseMultiplier = 3.0 + Math.random() * 1.0;
    baseShipping = 8;
  } else if (categoryId === 'home') {
    baseCost = 10.0 + Math.random() * 15;
    baseMultiplier = 2.8 + Math.random() * 1.0;
    baseShipping = 9;
  } else { // general
    baseCost = 5.0 + Math.random() * 15;
    baseMultiplier = 3.0 + Math.random() * 1.0;
    baseShipping = 8;
  }

  const cost = Math.round(baseCost * 10) / 10;
  const retail = Math.round((cost * baseMultiplier) * 10) / 10 - 0.01;
  const shipping = Math.round(baseShipping + (Math.random() * 4 - 2)); // +/- 2 days variance
  const sales = Math.round(1000 + Math.random() * 8000);
  const saturation = Math.round(15 + Math.random() * 70);
  const trend = `+${Math.round(40 + Math.random() * 200)}%`;

  // Specific content databases for the 6 sections based on Category
  const categoryTemplates = {
    beauty: {
      demographics: {
        who: "Mujeres de entre 25 y 55 años, de ingresos medios a altos, que consumen contenido activamente en TikTok, Instagram y blogs de belleza. Les preocupa el envejecimiento prematuro, la salud de su piel/cabello y buscan soluciones rápidas pero efectivas en casa.",
        attitudes: "Suelen ser altamente escépticas con los productos tradicionales debido a falsas promesas. Siguen tendencias de 'clean beauty' y 'biohacking capilar'. Valoran la opinión de influencers locales y la validación dermatológica.",
        dreams: "Tener una piel o cabello radiante que les devuelva la confianza de sus 20s. Quieren que sus amigas y colegas les pregunten cuál es su secreto, buscando admiración y la sensación de mantener el control de su cuerpo frente al paso del tiempo.",
        defeats: "Han gastado cientos de dólares en tratamientos en spas, cremas caras recomendadas por dermatólogos que les irritaron la piel, o herramientas de belleza baratas que se rompieron a los dos meses sin dar resultados.",
        outsideForces: "Culpan a las grandes marcas de cosméticos ('Big Cosmetics') por vender cremas llenas de químicos tóxicos y agua solo para mantenerlas atadas a rutinas de 10 pasos innecesarias e ineficaces.",
        prejudices: "Tienen el prejuicio de que las clínicas estéticas cobran precios abusivos solo por la marca y de que las personas que usan cosmética barata de farmacia realmente no se cuidan o no entienden de calidad.",
        belief: "Creen firmemente que una rutina de cuidado personal no es vanidad, sino una inversión en su salud mental y autoestima, y que la naturaleza combinada con la tecnología correcta supera a cualquier cirugía invasiva."
      },
      solutions: {
        current: "Cremas de alta gama, tratamientos químicos en salones de belleza, dispositivos de microcorriente de marcas caras, o remedios caseros sugeridos en Pinterest.",
        experience: "Se sienten abrumadas por la cantidad de pasos requeridos, cansadas de la consistencia necesaria para ver cambios mínimos y frustradas por la corta duración de los efectos.",
        likes: "Aprecian los resultados inmediatos (brillo al instante, suavidad) y los empaques premium que se ven bien en sus tocadores.",
        dislikes: "Detestan las quemaduras químicas, la irritación en la piel sensible, los cables molestos de los dispositivos tradicionales y el alto costo de mantenimiento/repuestos.",
        horrorStories: [
          `**El caso del peeling químico en casa**: Lucía usó una solución ácida popular recomendada por una influencer. A los 2 minutos, sintió que la cara le ardía. Al retirarla, tenía quemaduras de segundo grado en las mejillas que tardaron 3 meses en sanar con corticoides.`,
          `**El cepillo giratorio arrancador**: Marta compró un cepillo limpiador giratorio barato. En la segunda semana, el motor falló a máxima potencia, enredó su cabello y le arrancó un mechón entero cerca de la frente, además de dejarle la piel roja e inflamada.`,
          `**La máquina de puntos negros destructora de capilares**: Sofía usó un succionador de poros. La potencia era tan alta que le succionó la piel con tanta fuerza que le rompió decenas de microcapilares en la nariz, dejándole marcas moradas permanentes que requirieron láser.`
        ],
        skepticism: "Es extremadamente alto. Piensan que la mayoría de los anuncios de belleza usan filtros y Photoshop para ocultar la realidad, por lo que solo confían en videos de testimonios sin editar."
      },
      secrets: {
        historical: "En el antiguo Egipto, las reinas utilizaban aceites de semillas prensadas en frío y masajes con piedras pulidas de cuarzo para mantener la firmeza. No usaban químicos, sino estimulación física y extractos botánicos puros que la industria química moderna enterró para vender derivados de petróleo baratos.",
        conspiracy: "La industria de la cosmética tradicional sabe que el agua fría y la estimulación celular natural rejuvenecen la piel gratis. Por eso, financian estudios sesgados para convencerte de que necesitas cremas de $200 llenas de parabenos que en realidad crean dependencia en tu piel.",
        mechanismProblem: "El verdadero enemigo es la acumulación de toxinas linfáticas y la falta de microcirculación capilar profunda. La piel se marchita no por falta de cremas, sino porque los capilares se contraen por el estrés y el aire acondicionado, privando a las células de oxígeno.",
        mechanismSolution: `${formattedName} soluciona esto utilizando microvibraciones ultrasónicas de baja frecuencia que imitan los masajes de drenaje linfático franceses, forzando la apertura de los capilares y la absorción instantánea de los nutrientes celulares sin frotar ni irritar.`
      },
      eden: {
        goldenAge: "Antes de la revolución industrial y la comida procesada, las mujeres mantenían una piel limpia usando arcillas locales y aguas termales. Los problemas de acné crónico o envejecimiento severo a los 30 años eran casi inexistentes.",
        corruptor: "La introducción de los plásticos, parabenos en el maquillaje diario y las toxinas del ambiente moderno taparon nuestros poros e inflamaron nuestras células cutáneas sistemáticamente.",
        contrast: "Las mujeres de la tribu Hunza en el Himalaya conservan una piel tersa y libre de arrugas hasta los 70 años sin usar un solo producto químico. Su secreto es el lavado con agua mineral glacial pura y masajes diarios con aceites naturales prensados a mano."
      },
      verbatims: [
        "Siento que cada vez que me miro al espejo veo una arruga nueva y me da pánico envejecer tan rápido.",
        "Compré una crema de $80 y lo único que me dejó fue la cara llena de granitos y roja como un tomate.",
        "Estoy harta de los filtros de TikTok, solo quiero ver cómo luce una piel real sin maquillaje.",
        "Tengo miedo de hacerme botox y quedar con la cara congelada como una muñeca de plástico.",
        "Mi esposo dice que no necesito nada, pero sé que me mira diferente cuando ando cansada.",
        "Gastar $100 al mes en el salón ya no es sostenible con la economía actual.",
        "Con cada tratamiento químico que me hago, siento que daño más mi barrera cutánea a largo plazo.",
        "¿Hay algo que realmente funcione para los poros abiertos y que no sea solo marketing?",
        "Odio levantarme y ver mis ojos tan hinchados que parezco enferma.",
        "Mi hermana tiene una piel perfecta sin hacer nada y yo tengo que hacer una rutina de 12 pasos solo para no brotarme.",
        "A veces me da vergüenza salir sin base de maquillaje por las manchas.",
        "Los dispositivos con cables siempre terminan guardados en el cajón porque da pereza usarlos.",
        "Siento la piel opaca, apagada, como si no tuviera vida.",
        "Solo quiero recuperar el brillo natural que tenía antes de tener hijos.",
        "La esteticista me cobró una fortuna por un masaje que me dejó la cara doliendo tres días."
      ],
      avatar: {
        age: "28 a 45 años",
        gender: "Femenino (92%) / Masculino (8%)",
        location: "Zonas urbanas y suburbanas principales en España, México y Colombia",
        income: "$1,800 a $3,800 USD mensuales",
        background: "Profesionales corporativas, ejecutivas de marketing, administrativas, autónomas y creadoras de contenido digital.",
        identities: "Madres trabajadoras que intentan equilibrar vida familiar y estética, jóvenes profesionales preocupadas por los efectos del estrés de la oficina en la piel.",
        painPoints: {
          p1: { name: "Pérdida de elasticidad y arrugas prematuras", list: ["Marcado de líneas de expresión en la frente", "Piel apagada y deshidratada por la mañana", "Sensación de flacidez en la barbilla y pómulos"] },
          p2: { name: "Aparición de imperfecciones y poros abiertos", list: ["Exceso de sebo en la zona T por estrés", "Poros dilatados que arruinan la base de maquillaje", "Brotes de acné hormonal difíciles de sanar"] },
          p3: { name: "Efectos secundarios de tratamientos abrasivos", list: ["Piel irritada y roja por peelings ácidos", "Dependencia de cremas químicas que dañan la barrera", "Temor a quedar con rostro paralizado por bótox"] }
        },
        goals: {
          short: ["Reducir la hinchazón de los ojos al despertar", "Aumentar el brillo natural de la piel sin filtros", "Tener una rutina de cuidado rápida de 5 minutos"],
          long: ["Evitar o retrasar tratamientos invasivos con agujas", "Mantener una piel firme e hidratada pasados los 40", "Recuperar la autoconfianza al salir sin maquillaje"]
        },
        emotionalDrivers: [
          "El pánico silencioso al mirarse en el espejo del auto con luz natural y ver imperfecciones nuevas.",
          "El deseo de recibir elogios de sus amigas y que le pregunten cuál es su secreto de rejuvenecimiento.",
          "La necesidad de sentir control sobre su propio proceso de envejecimiento en una cultura corporativa competitiva."
        ],
        quotes: {
          general: [
            "Solo quiero despertar un día, mirarme al espejo y ver una piel que brille por sí sola, sin parches.",
            "Me da terror ver que mi piel envejece más rápido de lo que mi mente se adapta.",
            "Quiero soluciones reales que se adapten a mi ritmo de vida, no rutinas eternas de 10 pasos."
          ],
          pain: [
            "Gasté $120 en un sérum famoso y lo único que conseguí fue un sarpullido rojo e irritación extrema.",
            "Tengo los poros tan abiertos en las mejillas que la base se me cuartea a las dos horas de salir.",
            "Siento la piel del cuello tan flácida que a veces uso bufandas solo para esconderla."
          ],
          mindset: [
            "No es vanidad, es salud mental. Vernos bien nos da el poder de enfrentar el día con otra energía.",
            "El bótox y los rellenos me parecen una trampa cara y peligrosa que deforma los rostros.",
            "Prefiero mil veces activar los mecanismos naturales de mi piel que inyectarme químicos extraños."
          ],
          emotional: [
            "Mi esposo dice que me veo hermosa, pero yo sé que me mira diferente cuando ando cansada y sin brillo.",
            "Me da vergüenza abrir la puerta al repartidor sin haberme puesto al menos corrector de ojeras.",
            "Siento que la fatiga del trabajo de oficina se me está quedando grabada en la frente para siempre."
          ],
          responses: [
            "Cuando me veo la piel fatal, corro a comprar más maquillaje pesado, sabiendo que solo empeoro el problema.",
            "He intentado hacerme masajes con rodillos de cuarzo pero los dejo en el cajón porque cansan los brazos.",
            "Termino cancelando salidas con amigos porque me siento cansada de ver mi rostro marchito."
          ],
          success: [
            "Quiero que mi piel demuestre que me cuido, que me respeto y que soy fuerte.",
            "Quiero que la gente se sorprenda de mi edad real y que me admiren por cómo me mantengo activa.",
            "El éxito para mí es salir de casa con la cara lavada y sentirme sumamente atractiva y libre."
          ]
        },
        fears: [
          "Quedar con la expresión del rostro congelada o deformada por mala aplicación de rellenos clínicos.",
          "Desarrollar manchas oscuras permanentes por el sol e inflamación de tratamientos invasivos.",
          "Descubrir demasiado tarde que gastó miles de dólares en productos de marketing vacíos que no sirvieron para nada."
        ],
        insights: [
          "El comprador no busca ingredientes de laboratorio; busca el alivio emocional de recuperar su identidad juvenil.",
          "Existe una correlación directa entre el aumento de horas de pantalla (luz azul) y el pánico del cliente por el envejecimiento.",
          "La validación no proviene del empaque científico, sino del testimonio visceral y sin editar de otra mujer real."
        ],
        journey: {
          awareness: "El avatar nota líneas de expresión más marcadas y ojeras persistentes que el maquillaje normal ya no puede disimular bajo las luces frías de su oficina.",
          frustración: "Prueba cremas de marca caras recomendadas por influencers en redes, pero solo obtiene brotes de acné, irritación temporal y gasto económico inútil.",
          desesperación: "Busca activamente en foros y videos de TikTok alternativas no invasivas, considerando seriamente el costo y riesgo de inyecciones estéticas dolorosas.",
          alivio: "Descubre la estimulación celular natural del producto, experimenta firmeza visible en las primeras semanas y adopta el dispositivo como su ritual diario de confianza."
        }
      },
      offer: {
        names: ["AuraGlow Facial Massager", "BioLifting Sonic Wand", "YouthRestore Micro-Current Wand"],
        awareness: "Consciente de la solución (Conoce que existen masajeadores, pero no entiende por qué este es diferente).",
        sophistication: "Nivel 4 (Mercado saturado de rodillos de jade y vibradores simples; requiere un Mecanismo Único biológico y de microvibración).",
        bigIdea: "El 'Gimnasio Linfático Pasivo' que drena la fatiga facial y reactiva el colágeno dormido en 3 minutos sin agujas.",
        metaphor: "Un tratamiento de spa francés de $150 comprimido en un lápiz de bolsillo que puedes usar en tu escritorio.",
        ump: "El sedentarismo capilar y linfático. Las toxinas se acumulan bajo la piel del rostro por la gravedad y la falta de contracción muscular facial profunda, bloqueando el oxígeno y marchitando las células.",
        ums: "Microvibración ultrasónica de alta frecuencia pulsada que imita el drenaje manual francés, empujando las toxinas hacia los ganglios linfáticos y succionando oxígeno fresco a la superficie celular.",
        guru: "Una esteticista senior retirada de un resort de lujo en París que revela las técnicas físicas de las modelos para evitar el bótox.",
        discovery: "Descubierto al observar cómo las actrices de teatro del siglo XIX mantenían la mandíbula firme usando masajes con cucharas de plata frías y fricción de alta velocidad para inducir hiperemia protectora.",
        product: "Dispositivo ergonómico de microvibración recargable con cabezal de aleación térmica que estimula el drenaje y potencia la absorción de nutrientes.",
        headlines: [
          "¿Por Qué Las Modelos Parisinas Odian El Bótox? El Secreto Físico Que Mantiene Su Mandíbula Firme Después De Los 40",
          "El Lápiz de 3 Minutos Que Drena Las Toxinas Acumuladas En Tu Rostro Y Devuelve El Brillo De Tus 20s",
          "Cómo Desactivar 'La Piel de Oficina': El Hack de Estimulación Linfática Que Reactiva El Colágeno Dormido"
        ],
        objections: [
          "¿Esto realmente funciona o es otro rodillo de jade inútil? (Respuesta: Funciona por ultrasonido pulsado clínico, no fricción manual).",
          "¿Me va a irritar mi piel ultra-sensible? (Respuesta: La aleación hipoalergénica y térmica calma la piel en lugar de rasparla).",
          "Es muy caro para ser un dispositivo pequeño. (Respuesta: Cuesta menos que una sola sesión de spa y dura años).",
          "No tengo tiempo para usarlo todos los días. (Respuesta: Solo toma 3 minutos mientras ves televisión o respondes correos)."
        ],
        beliefs: [
          "Que el envejecimiento no se cura tapando la piel con cremas pesadas de petróleo.",
          "Que la acumulación de líquidos linfáticos y la falta de sangre oxigenada es lo que realmente causa la flacidez.",
          "Que este dispositivo estimula físicamente la producción interna de colágeno mucho mejor que inyectárselo."
        ],
        funnel: "Advertorial de historia de descubrimiento -> Video demostrativo sin filtros -> Landing Page de alta conversión enfocada en el dolor de oficina y envejecimiento -> Checkout con Up-sell de sérum de ácido hialurónico puro.",
        domains: ["auraglowskincare.com", "bioliftingwand.store", "glowsecret.co"]
      }
    },
    pet: {
      demographics: {
        who: "Dueños de mascotas apasionados (perros y gatos), solteros o parejas jóvenes (millennials sin hijos) y jubilados que tratan a sus mascotas como miembros de la familia. Tienen ingresos medios a altos y compran online por conveniencia.",
        attitudes: "Tienen una actitud de sobreprotección hacia sus mascotas. Son escépticos de la comida de supermercado y buscan productos premium, seguros y de grado humano. Son activos en comunidades de amantes de los animales.",
        dreams: "Asegurar que sus mascotas vivan la vida más larga, saludable y feliz posible. Sueñan con no tener que dejar solos a sus animales o, si lo hacen, que no sientan ansiedad. Buscan la paz mental de saber que están siendo excelentes 'padres' de mascotas.",
        defeats: "Han fallado en corregir comportamientos destructivos (ansiedad por separación), han comprado juguetes caros que su mascota destruyó en 10 minutos, o comederos que se atascaron y dejaron a su mascota sin comer todo el día.",
        outsideForces: "Culpan a las multinacionales de alimentos para mascotas por usar ingredientes basura llenos de almidones que enferman a los animales para ahorrar costos, y a las veterinarias corporativas por vender tratamientos innecesarios.",
        prejudices: "Consideran que las personas que dejan a sus perros amarrados en el patio trasero o les dan sobras de comida no merecen tener mascotas y son insensibles.",
        belief: "Creen que los animales tienen almas y sentimientos idénticos a los de los humanos, y que la lealtad de una mascota supera a la de cualquier persona, por lo que merecen el mejor cuidado posible en el hogar."
      },
      solutions: {
        current: "Juguetes masticables estándar, comederos de plástico manuales, cuidadores de mascotas pagados por el día, o suplementos para la ansiedad formulados químicamente.",
        experience: "Se preocupan constantemente mientras están en el trabajo, sufren de culpa cuando viajan y gastan demasiado dinero en servicios de cuidado que no les dan total confianza.",
        likes: "Aman los productos duraderos que mantienen entretenida a la mascota y las soluciones que les permiten vigilarla de forma remota.",
        dislikes: "Detestan los juguetes que se desmoronan y pueden causar asfixia, las aplicaciones de cámaras que fallan y pierden la conexión, y los comederos automáticos que no funcionan si se corta la luz.",
        horrorStories: [
          `**El comedero que causó deshidratación**: Javier se fue de viaje por el fin de semana confiando en un alimentador Wi-Fi barato. La app se desconectó debido a una actualización silenciosa y el motor se bloqueó. Al regresar el domingo por la noche, encontró a su gato maullando débilmente, severamente deshidratado y sin haber comido en 48 horas.`,
          `**El juguete tragado de urgencia**: Diana le compró un juguete de caucho supuestamente indestructible a su Golden Retriever. En menos de una hora, el perro arrancó y se tragó una pieza del tamaño de una pelota de golf. Tuvieron que hacerle una cirugía de emergencia de $2,400 de medianoche para salvarle la vida.`,
          `**El collar de entrenamiento que quemó la piel**: Carlos usó un collar barato anti-ladridos automático. El sensor de vibración falló y se activó repetidamente mientras el perro dormía por un ruido exterior, causándole quemaduras por fricción y shock nervioso al animal.`
        ],
        skepticism: "Es medio-alto. Temen que los productos baratos importados contengan plásticos tóxicos o plomo que envenene lentamente a sus mascotas al morderlos o comer de ellos."
      },
      secrets: {
        historical: "Antes de la domesticación masiva e industrializada, los cánidos y felinos cazaban comida fresca y masticaban raíces específicas para limpiar sus dientes. No existía la placa bacteriana ni la obesidad. La sabiduría antigua muestra que los animales necesitan estimulación mental activa y hábitos naturales para prevenir la depresión y la muerte prematura.",
        conspiracy: "Las grandes farmacéuticas veterinarias prefieren que tu mascota sufra de ansiedad y problemas digestivos porque las recetas de ansiolíticos y las cirugías dentales son los servicios más rentables de las clínicas.",
        mechanismProblem: "El verdadero enemigo es el cortisol elevado. El aburrimiento y la inactividad en departamentos cerrados deprime su sistema inmune y acorta su vida hasta en 4 años.",
        mechanismSolution: `${formattedName} imita el comportamiento de caza y estimulación natural del animal mediante un diseño ergonómico y automatizado que reduce los picos de cortisol, manteniéndolo calmado, seguro y entretenido de forma autónoma.`
      },
      eden: {
        goldenAge: "En el pasado, las mascotas vivían al aire libre en granjas, corriendo kilómetros diarios y comiendo dietas basadas en proteínas reales directas del campo. La diabetes y el cáncer canino eran anomalías médicas.",
        corruptor: "El encierro en pequeños departamentos urbanos y la sustitución de alimentos frescos por croquetas ultraprocesadas secas llenas de gluten introdujeron la epidemia de obesidad y ansiedad en nuestras mascotas.",
        contrast: "Los perros de trineo en Alaska o los pastores de los Alpes mantienen una salud de hierro y viven hasta los 20 años sin pisar una veterinaria. Su secreto es el movimiento constante, aire limpio y el cumplimiento de sus instintos naturales diarios."
      },
      verbatims: [
        "Me rompe el corazón ver la cara de mi perro cuando cierro la puerta para irme a trabajar.",
        "Compré un juguete interactivo caro y mi gato lo ignoró por completo a los dos minutos.",
        "Tengo miedo de que el comedero falle cuando esté fuera y mi mascota se quede con hambre.",
        "Odio el olor a comida de perro barata, huele a químicos y basura.",
        "Gastar $50 diarios en una guardería de mascotas me está dejando en la ruina.",
        "Mi perro destruye todo lo que toca, ya no sé qué comprarle que dure más de un día.",
        "Me da pánico que se trague un pedazo de plástico y tener que operarlo de urgencia.",
        "Siento que mi gato pasa durmiendo todo el día por depresión porque no estoy en casa.",
        "¿Por qué los juguetes para mascotas tienen que ser tan feos y arruinar la decoración de la sala?",
        "Mi perro ladra como loco cuando me voy y los vecinos ya me amenaron con denunciarme.",
        "Quiero que mi mascota viva para siempre, es mi mejor amiga en este mundo solitario.",
        "Los veterinarios solo quieren cobrarte exámenes caros por cualquier tontería.",
        "Esta app de cámara para mascotas nunca se conecta cuando estoy en la oficina, es una estafa.",
        "Mi perro tiene el estómago tan sensible que cualquier cambio de rutina le da diarrea.",
        "Solo quiero la tranquilidad de saber que mi gato está bien comido y feliz mientras trabajo."
      ],
      avatar: {
        age: "24 a 45 años",
        gender: "Femenino (60%) / Masculino (40%)",
        location: "Grandes ciudades y zonas metropolitanas (apartamentos)",
        income: "$2,200 a $4,500 USD mensuales",
        background: "Profesionales de tecnología, marketing, finanzas, creativos y ejecutivos urbanos que pasan más de 8 horas fuera de casa.",
        identities: "Millennials solteros o parejas sin hijos ('DINKs') que consideran a sus mascotas como hijos legítimos ('perrhijos' o 'gathijos').",
        painPoints: {
          p1: { name: "Ansiedad por separación en la mascota", list: ["Aullidos y ladridos constantes cuando está sola", "Destrucción de muebles y zapatos cerca de la puerta", "Auto-lamido obsesivo por estrés del animal"] },
          p2: { name: "Falta de control de la alimentación en ausencias", list: ["Atascos recurrentes en comederos automáticos", "Sobrepeso debido a porciones mal calculadas en platos manuales", "Miedo a retrasarse en el tráfico y dejar al animal con hambre"] },
          p3: { name: "Aburrimiento y letargo por falta de espacio", list: ["Mascotas durmiendo más de 16 horas por apatía", "Falta de juguetes interactivos que duren más de un día", "Aumento de placa dental por falta de masticación activa"] }
        },
        goals: {
          short: ["Monitorear que la mascota coma a sus horas exactas", "Detener los ladridos molestos por ansiedad en el apartamento", "Mantener entretenido al perro o gato al menos por 2 horas seguidas"],
          long: ["Asegurar que la mascota viva una vida larga libre de diabetes canina", "Poder viajar los fines de semana sin la culpa de dejar sola a la mascota", "Reducir las costosas facturas veterinarias por problemas gástricos"]
        },
        emotionalDrivers: [
          "La inmensa culpa de cerrar la puerta y ver los ojos de tristeza de su perro al irse a trabajar.",
          "El miedo a recibir una queja formal del casero o de los vecinos del edificio debido a los ladridos.",
          "El deseo de ser considerado un dueño ejemplar e integral que le da una vida premium a su animal."
        ],
        quotes: {
          general: [
            "Mi perro es mi familia, literalmente paso el día pensando si estará aburrido o triste en casa.",
            "Me mata tener que dejar a mi gato solo por 10 horas debido al trabajo.",
            "Quiero productos que sean seguros y duren, no juguetes chinos de plástico tóxico."
          ],
          pain: [
            "Regresé de la oficina y mi perro había destrozado la alfombra de la sala por pura ansiedad.",
            "Compré un dispensador y se trabó con las croquetas grandes, mi gato pasó el día sin comer.",
            "El veterinario me cobró una fortuna por una indigestión porque mi perro come muy rápido."
          ],
          mindset: [
            "Ellos no eligieron vivir encerrados en un apartamento, es nuestro deber hacer su vida feliz.",
            "Prefiero gastar en prevención y buena tecnología que en cirugías de emergencia en clínicas caras.",
            "La salud mental de mi perro es tan importante como la mía, el estrés los enferma rápido."
          ],
          emotional: [
            "Siento que le estoy robando años de vida a mi mascota al dejarla encerrada sola tanto tiempo.",
            "A veces me siento un mal dueño por no poder pagar un paseador de perros todos los días.",
            "Ver a mi gato gordo y apático durmiendo todo el día me deprime muchísimo."
          ],
          responses: [
            "Intento dejarle la televisión encendida al perro para que no se sienta solo, pero no sirve de nada.",
            "Le compro juguetes interactivos baratos de supermercado que destruye y se traga en minutos.",
            "Le doy comida extra en el plato antes de salir, lo cual solo está causando que tenga sobrepeso."
          ],
          success: [
            "Quiero viajar sabiendo que mi mejor amigo está comiendo exactamente lo que necesita y está a salvo.",
            "El éxito es entrar a casa y encontrar a mi perro calmado, feliz y sin haber destrozado nada.",
            "Quiero que mi mascota viva hasta los 18 años sana y corriendo a mi lado."
          ]
        },
        fears: [
          "Que la mascota sufra una obstrucción intestinal severa por tragarse piezas plásticas de juguetes defectuosos.",
          "Regresar a casa y encontrar que la mascota tuvo un accidente grave y no hubo forma de saberlo.",
          "Ser denunciado por los vecinos y verse obligado a mudarse de apartamento por culpa de los ladridos."
        ],
        insights: [
          "La compra de tecnología para mascotas es una compra de 'paz mental' y mitigación de la culpa del dueño.",
          "El cliente prefiere marcas con lenguaje de comunidad y amor por los animales frente a marcas puramente técnicas.",
          "Las reseñas con videos del animal interactuando con el producto multiplican la tasa de conversión por tres."
        ],
        journey: {
          awareness: "El usuario nota que su mascota está deprimida, destruye cosas o sube de peso debido a la rutina de encierro mientras trabaja.",
          frustración: "Gasta dinero en juguetes masticables normales que duran minutos, o comederos automáticos que fallan constantemente y le causan ansiedad.",
          desesperación: "Busca activamente en foros y grupos de Facebook soluciones para la ansiedad por separación y la alimentación programada.",
          alivio: "Prueba el producto automatizado, nota que su mascota regula su alimentación, se mantiene entretenida y entra en un estado de calma."
        }
      },
      offer: {
        names: ["PetPulse Smart Feeder", "AnxiShield Interactive Pet Hub", "ZenPaw Automático"],
        awareness: "Consciente del problema (Sabe que su mascota sufre de ansiedad o mala alimentación, pero no conoce la solución tecnológica).",
        sophistication: "Nivel 3 (Ya existen comederos y juguetes en el mercado; la oferta debe destacar por su mecanismo de seguridad anti-atascos e interactividad emocional).",
        bigIdea: "El sistema de 'Presencia Virtual y Nutrición Calibrada' que elimina la ansiedad de separación de tu mascota mientras trabajas.",
        metaphor: "Un niñera digital y nutricionista interactivo para tu mascota en un solo dispositivo.",
        ump: "El atasco mecánico y la falta de estímulo interactivo. Los comederos tradicionales fallan por falta de torque en las aspas y los juguetes no retienen la atención porque no simulan estímulos biológicos vivos.",
        ums: "Aspas de silicona auto-reversibles anti-atascos combinadas con un sensor de presencia y reproducción de voz pregrabada que simula tu llegada cada vez que se sirve comida.",
        guru: "Un etólogo y psicólogo de comportamiento canino con 15 años entrenando perros de servicio para personas con discapacidad.",
        discovery: "Descubierto al entrenar perros de rescate en zonas de desastre, donde se usaban grabaciones de voz del dueño y dispensadores mecánicos blindados para mantener a los perros estables en largas ausencias.",
        product: "Comedero y juguete inteligente de grado alimentario, libre de BPA, con cámara HD y dispensador rotativo anti-obstrucciones.",
        headlines: [
          "El Dispositivo Que Elimina La Culpa De Dejar A Tu Mascota Sola En El Apartamento Durante 8 Horas",
          "¿Mascota Ansiosa O Aburrida? El Hack De Estimulación Sensorial Que Los Mantiene Calmos Y Felices",
          "Por Qué Los Comederos Comunes Pueden Dejar A Tu Mascota Sin Comer: El Mecanismo Anti-Atascos De ${formattedName}"
        ],
        objections: [
          "¿Qué pasa si se corta el internet en casa? (Respuesta: Cuenta con almacenamiento interno y batería de respaldo para seguir funcionando).",
          "Mi perro es gigante y destructivo, ¿lo va a romper? (Respuesta: Estructura de ABS reforzado a prueba de mordeduras y golpes).",
          "Las croquetas de mi perro son muy grandes. (Respuesta: Aspas flexibles adaptadas para tamaños de hasta 15mm de diámetro).",
          "¿Es difícil de configurar en el teléfono? (Respuesta: Se conecta en 60 segundos con código QR y es compatible con iOS y Android)."
        ],
        beliefs: [
          "Que las mascotas sufren en silencio una depresión severa por aburrimiento crónico en la ciudad.",
          "Que la consistencia en el horario de las porciones evita visitas de urgencia al veterinario.",
          "Que escuchar la voz de su dueño les da seguridad física y reduce el cortisol instantáneamente."
        ],
        funnel: "Video de TikTok con alta carga emocional de la mascota esperando en la puerta -> Landing page enfocada en evitar la ansiedad y atascos de comederos baratos -> Garantía de reembolso por rotura de 1 año -> Envío gratis rápido.",
        domains: ["petpulsefeeder.store", "zenpawsmart.com", "anxishieldpet.co"]
      }
    },
    health: {
      demographics: {
        who: "Hombres y mujeres de 35 a 65 años que sufren de dolores crónicos (espalda, cuello, rodillas), fatiga o problemas de sueño. Trabajan sentados muchas horas o realizan esfuerzos físicos repetitivos. Ingresos medios.",
        attitudes: "Están profundamente frustrados con la medicina tradicional y los analgésicos que dañan el estómago. Tienen una actitud de escepticismo hacia soluciones milagrosas pero están desesperados por alivio. Buscan soluciones naturales, físicas y basadas en la ciencia.",
        dreams: "Poder jugar con sus hijos o nietos sin sentir un pinchazo en la espalda, levantarse por la mañana sin rigidez y tener suficiente energía para disfrutar sus fines de semana sin depender de pastillas.",
        defeats: "Han ido a fisioterapeutas caros que solo les dan masajes temporales, han probado plantillas ortopédicas inútiles, fajas calientes que sudan y raspan, y estiramientos de YouTube que les empeoraron el dolor.",
        outsideForces: "Culpan a las grandes farmacéuticas ('Big Pharma') por recetar analgésicos adictivos para ocultar los síntomas en lugar de curar la causa física, y al estilo de vida sedentario corporativo impuesto por la sociedad.",
        prejudices: "Tienen prejuicios contra los médicos jóvenes que los despachan en 5 minutos con una receta de ibuprofeno, y contra las personas que dicen 'es solo cuestión de edad' justificando el dolor.",
        belief: "Creen que el cuerpo tiene la capacidad de sanarse a sí mismo si se elimina la presión mecánica y se restaura el flujo sanguíneo natural, y que el dolor crónico destruye la personalidad de una persona si no se trata."
      },
      solutions: {
        current: "Analgésicos diarios (ibuprofeno, paracetamol), parches de calor, sesiones de quiropráctica, fajas de soporte baratas o almohadas ortopédicas estándar.",
        experience: "Sienten un alivio temporal que dura unas pocas horas, seguido del regreso del dolor con más fuerza. Experimentan acidez estomacal por exceso de medicamentos y dependencia psicológica.",
        likes: "Valoran el alivio rápido y directo del dolor intenso y los productos que son fáciles de ocultar bajo la ropa.",
        dislikes: "Detestan los materiales rígidos que raspan la piel, el sudor acumulado por neopreno barato, los parches que huelen a mentol fuerte en el trabajo y tener que ir a citas médicas constantemente.",
        horrorStories: [
          `**La hernia discal por faja rígida**: Roberto usó una faja lumbar barata ultra-ajustada para cargar cajas. La faja debilitó sus músculos abdominales por completo. En un movimiento simple sin la faja puesta al día siguiente, su columna quedó desprotegida y sufrió una hernia discal L4-L5 que requirió cirugía.`,
          `**La quemadura química del parche**: Isabel se puso un parche analgésico de máxima potencia para dormir. El adhesivo reaccionó con su piel sensible durante la noche, causándole una quemadura química severa que le arrancó la primera capa de piel al retirarlo, dejándole cicatrices.`,
          `**El estirador que bloqueó el cuello**: Manuel usó un dispositivo de tracción cervical inflable. Al inflarlo de más por desesperación, el dispositivo le presionó la arteria carótida, causándole un desmayo inmediato, una caída y un esguince cervical severo.`
        ],
        skepticism: "Es extremadamente alto. Han sido engañados por docenas de correctores y dispositivos mágicos que prometen curas en 7 días y solo terminan acumulando polvo en el closet."
      },
      secrets: {
        historical: "Antes de la medicina moderna, los antiguos guerreros utilizaban técnicas de descompresión por gravedad y alineación esquelética con madera para curar a los soldados después de las batallas. Sabían que el dolor no se cura durmiendo al cerebro con drogas, sino liberando físicamente la presión de los nervios comprimidos por la gravedad.",
        conspiracy: "Los cirujanos de columna y las farmacéuticas saben que la descompresión física pasiva cura el 90% de los dolores de espalda. Sin embargo, no la promueven porque las cirugías de columna de $50,000 y las recetas recurrentes de analgésicos son su mayor fuente de ingresos.",
        mechanismProblem: "El verdadero origen del dolor no es la edad, sino la compresión de los discos intervertebrales y la falta de flujo sanguíneo oxigenado en los músculos profundos de la espalda, que se 'apagan' por estar sentados.",
        mechanismSolution: `${formattedName} funciona aplicando una descompresión geométrica precisa sobre los puntos gatillo del cuerpo, forzando la rehidratación de los discos comprimidos y devolviendo el flujo de oxígeno al instante sin medicamentos.`
      },
      eden: {
        goldenAge: "Antes de la revolución de las computadoras y los trabajos de oficina, los humanos caminaban más de 10 kilómetros diarios y cargaban peso de forma ergonómica natural. La ciática o la rectificación cervical eran condiciones casi desconocidas.",
        corruptor: "Las sillas de oficina no ergonómicas, las pantallas de los teléfonos que nos obligan a mirar hacia abajo constantemente y el sedentarismo forzado atrofiaron nuestros músculos de soporte.",
        contrast: "Los agricultores tradicionales en zonas rurales de Asia y América Latina trabajan físicamente hasta los 80 años sin sufrir de dolor crónico de espalda. Su secreto es el movimiento multiarticular diario y la postura ergonómica natural de cuclillas."
      },
      verbatims: [
        "Me levanto todas las mañanas sintiéndome como si tuviera 90 años por la rigidez.",
        "Estoy harto de tomar ibuprofeno todos los días, me está destrozando el estómago.",
        "Con cada bocado de pastillas que tomo, sé que solo estoy tapando el dolor temporalmente.",
        "No puedo jugar con mis nietos en el suelo porque sé que luego no me podré levantar.",
        "El médico me dijo que es por la edad y que tengo que aprender a vivir con el dolor.",
        "Gastar $80 por sesión de quiropráctica ya se volvió imposible para mi bolsillo.",
        "He probado todas las fajas de Amazon y todas se me clavan en las axilas o me hacen sudar.",
        "Me da miedo quedar postrado en una cama si mi espalda da un mal tirón un día de estos.",
        "Siento un ardor constante en el cuello que se me pasa a los hombros y me da dolor de cabeza.",
        "Trabajar sentado 8 horas es una tortura diaria para mi zona lumbar.",
        "Mi hermana me recomendó yoga, pero me duele tanto que no puedo hacer ni la primera postura.",
        "Este dolor constante me está cambiando el humor, siempre ando de mal genio con mi familia.",
        "Los correctores de postura de neopreno huelen horrible después de usarlos dos horas.",
        "Solo quiero poder dormir una noche completa sin despertarme del dolor al darme la vuelta.",
        "Siento que mi cuerpo está fallando y solo tengo 45 años, no es justo."
      ],
      avatar: {
        age: "35 a 65 años",
        gender: "Femenino (48%) / Masculino (52%)",
        location: "Zonas suburbanas y residenciales urbanas",
        income: "$1,200 a $3,200 USD mensuales",
        background: "Conductores de larga distancia, personal de almacenes, albañiles, informáticos, oficinistas sénior y jubilados.",
        identities: "Padres de familia de clase trabajadora y profesionales que sufren de rigidez articular por desgaste mecánico o malas posturas laborales.",
        painPoints: {
          p1: { name: "Compresión nerviosa y dolor ciático", list: ["Pinchazos agudos que se extienden por el glúteo", "Pérdida de sensibilidad en el pie por compresión lumbar", "Dificultad para caminar más de tres cuadras seguidas"] },
          p2: { name: "Rigidez cervical e inflamación del hombro", list: ["Pérdida de rango de movimiento al girar el cuello", "Dolor sordo y constante en hombros por mala postura", "Migrañas crónicas debido a la tensión cervical acumulada"] },
          p3: { name: "Efectos secundarios por automedicación analgésica", list: ["Gastritis y acidez gástrica por consumo de Ibuprofeno", "Necesidad de dosis mayores para obtener el mismo efecto", "Miedo a dañar los riñones o el hígado a largo plazo"] }
        },
        goals: {
          short: ["Levantarse de la cama sin dolor ni rigidez", "Trabajar una jornada completa sin necesidad de pastillas", "Poder sentarse a ver televisión sin incomodidad constante"],
          long: ["Evitar una cirugía de columna de alto costo y riesgo", "Mantener la movilidad física e independencia pasados los 60", "Poder viajar por carretera largas horas sin sufrir de la espalda"]
        },
        emotionalDrivers: [
          "La frustración de sentirse inútil e incapaz de realizar labores domésticas básicas por el dolor.",
          "El temor a perder su empleo o capacidad de trabajar físicamente por su espalda debilitada.",
          "El anhelo de no ser una carga para su cónyuge y de poder jugar activamente en el suelo con sus nietos."
        ],
        quotes: {
          general: [
            "Solo quiero un día normal, levantarme y no tener que pensar en qué pastilla tomar primero.",
            "Los quiroprácticos me han costado una fortuna y el dolor siempre regresa al día siguiente.",
            "El dolor crónico te roba la alegría, te cambia el humor y te aleja de tu familia."
          ],
          pain: [
            "Ayer intenté levantar una caja de herramientas y sentí un chasquido que me dejó inmóvil en el piso.",
            "El dolor de cuello es tan fuerte por las tardes que me dan ganas de vomitar por la migraña.",
            "Tengo la espalda baja tan inflamada que no puedo estar de pie en la cocina por más de 10 minutos."
          ],
          mindset: [
            "La vejez no debería significar vivir con dolor constante, eso no es vida.",
            "Sé que las pastillas solo apagan la alarma del cuerpo pero no apagan el incendio.",
            "Prefiero mil veces una solución física que seguir envenenando mi estómago con químicos."
          ],
          emotional: [
            "Me da vergüenza tener que pedirle a mi hijo de 15 años que me ayude a amarrarme los zapatos.",
            "Siento que este dolor me está amargando el carácter, me enojo por todo con mi esposa.",
            "Tengo miedo de levantarme un día y darme cuenta de que ya no puedo caminar en absoluto."
          ],
          responses: [
            "He comprado todas las fajas magnéticas de la tele y todas terminaron en la basura por ser incómodas.",
            "Paso los fines de semana acostado con hielo para intentar recuperarme para el lunes de trabajo.",
            "Trato de hacer estiramientos de internet pero a veces me duele tanto que me quedo trabado."
          ],
          success: [
            "El éxito es poder salir a caminar con mi esposa al parque de la mano sin tener que sentarme a los 5 minutos.",
            "Quiero demostrarle a los médicos que mi espalda puede sanar sin necesidad de cuchillo y cirugías.",
            "Mi meta es volver a levantar a mis nietos en el aire y escuchar sus risas con orgullo."
          ]
        },
        fears: [
          "Quedar postrado de por vida en una silla de ruedas debido a una mala cirugía de hernia discal.",
          "Tener que depender de analgésicos derivados del opio y perder su claridad mental y su dinero.",
          "Volverse una carga física y económica insostenible para su familia."
        ],
        insights: [
          "La compra de productos ortopédicos es impulsada por la desesperación ante la rigidez matutina.",
          "La terminología científica debe combinarse con analogías físicas simples (ej. la manguera doblada que corta el agua).",
          "Los testimonios escritos a mano y de lenguaje sencillo (con fallas comunes) aumentan la confianza del mercado sénior."
        ],
        journey: {
          awareness: "El avatar siente pinchazos ciáticos severos o rigidez lumbar crónica que no disminuye con el descanso del fin de semana.",
          frustración: "Toma dosis altas de antiinflamatorios que le causan acidez y recurre a fajas elásticas molestas que solo debilitan más sus músculos lumbares.",
          desesperación: "Busca activamente en foros médicos y videos de especialistas sobre descompresión vertebral y tratamientos no invasivos.",
          alivio: "Utiliza el producto ortopédico de descompresión física, experimenta alivio por liberación del nervio y recupera la movilidad diaria."
        }
      },
      offer: {
        names: ["SpineRelief Decompressor", "SciaticaShield Ortho Belt", "CervicalPulse Neck Stretcher"],
        awareness: "Consciente del problema (Sabe perfectamente dónde le duele, pero ignora que la causa es la compresión intervertebral física).",
        sophistication: "Nivel 3 (Mercado lleno de fajas y cremas térmicas; se requiere un mecanismo físico de descompresión geométrica claro).",
        bigIdea: "El sistema de 'Descompresión Vertebral Geométrica' que libera los nervios comprimidos en casa sin pagar miles en clínicas.",
        metaphor: "Un gato hidráulico de precisión diseñado para separar con seguridad tus vértebras comprimidas.",
        ump: "El aplastamiento por gravedad. La compresión gravitacional de los discos vertebrales a lo largo de los años atrapa y estrangula las raíces nerviosas ciáticas, cortando el flujo sanguíneo y el oxígeno celular.",
        ums: "Estructura ortopédica con curvas de tracción multinivel patentadas que aprovechan el peso corporal del usuario para estirar la columna de forma pasiva, rehidratando los discos en minutos.",
        guru: "Un cirujano ortopédico militar retirado con 30 años tratando lesiones de columna de paracaidistas sin cirugías.",
        discovery: "Descubierto al analizar cómo los astronautas regresan a la Tierra con mayor estatura y sin dolor de espalda debido a la ausencia de gravedad y la descompresión espinal natural.",
        product: "Estirador y descompresor ortopédico ajustable con puntos de acupresión de ABS médico de alta densidad.",
        headlines: [
          "Cómo Liberar El Nervio Ciático Atrapado En Casa Usando El Método De Descompresión Geométrica",
          "El 'Gato Hidráulico' De 5 Minutos Que Alivia La Rigidez De Tu Espalda Sin Fisioterapeutas Ni Drogas",
          "¿Gastritis Por Tomar Ibuprofeno? La Solución Ortopédica Física Que Ataca La Causa Del Dolor De Espalda"
        ],
        objections: [
          "¿Esto me va a lesionar más la hernia? (Respuesta: No, el estiramiento es pasivo y controlado 100% por la gravedad de tu propio peso corporal).",
          "¿Se va a doblar con mi peso? (Respuesta: Soporta hasta 150 kg gracias a su construcción en ABS de grado médico industrial).",
          "Es muy rígido e incómodo. (Respuesta: Cuenta con una almohadilla central de espuma viscoelástica para proteger la columna).",
          "Ya probé fajas y no me sirvieron. (Respuesta: Las fajas debilitan tus músculos; este estirador descomprime la estructura esquelética activa)."
        ],
        beliefs: [
          "Que el dolor de espalda no es crónico ni por la edad, sino un problema mecánico reversible de presión.",
          "Que tomar analgésicos en exceso destruye el estómago y los riñones sin curar la raíz del dolor.",
          "Que 5 minutos de descompresión física al día previenen cirugías de columna altamente peligrosas."
        ],
        funnel: "Advertorial enfocado en la 'trampa del Ibuprofeno' -> Demostración en video 3D del estiramiento vertebral -> Landing page con anatomía simple y testimonios de clase trabajadora -> Garantía de alivio o devolución de dinero de 30 días.",
        domains: ["spinedecompressor.store", "spineorthobelt.com", "sciaticashield.co"]
      }
    },
    home: {
      demographics: {
        who: "Adultos de 28 a 55 años, con casa propia o apartamento de alquiler, interesados en el diseño de interiores, el confort del hogar, el bienestar mental y la organización. Compran en plataformas de e-commerce buscando valor y estética.",
        attitudes: "Valoran la estética visual, la paz mental y la desconexión tecnológica en casa. Les interesa el concepto de 'hogar como santuario'. Buscan productos que tengan buena relación calidad-precio y aporten un toque moderno.",
        dreams: "Tener un hogar que parezca salido de una revista de diseño y que actúe como un refugio de paz contra el caos del trabajo diario. Quieren impresionar a sus visitas y sentirse relajados al cruzar la puerta de entrada.",
        defeats: "Han comprado decoraciones baratas que lucían geniales en las fotos pero parecían plástico de mala calidad al recibirlas, o difusores/lámparas que dejaron de funcionar a las dos semanas inundando de agua sus muebles.",
        outsideForces: "Culpan a las grandes cadenas de muebles por vender productos genéricos sin personalidad a precios inflados y a las marcas baratas por inundar el mercado con plástico de mala calidad que dura una semana.",
        prejudices: "Tienen prejuicios contra los hogares desordenados o mal decorados (los ven como reflejo de una mente caótica) y contra las personas que compran muebles masivos y anticuados sin estilo.",
        belief: "Creen que el entorno físico afecta directamente la salud mental y la productividad, y que un hogar ordenado y con la atmósfera adecuada puede curar el estrés del día más difícil."
      },
      solutions: {
        current: "Velas aromáticas tradicionales, humidificadores de farmacia de plástico blanco, ambientadores en aerosol llenos de químicos sintéticos, o lámparas de noche estándar.",
        experience: "Se cansan de tener que comprar velas constantemente (que además son un peligro de incendio), de usar humidificadores ruidosos difíciles de limpiar y de los ambientadores artificiales que dan dolor de cabeza.",
        likes: "Aman los diseños minimalistas, las luces cálidas regulables y los productos con apagado automático de seguridad.",
        dislikes: "Detestan el ruido de motor constante de los humidificadores de baja calidad, el moho que se acumula en los tanques difíciles de abrir y los cables de corriente cortos que limitan la colocación.",
        horrorStories: [
          `**El incendio de la vela aromática**: Claudia encendió una vela perfumada premium en su mesa de noche. Se quedó dormida por el cansancio. El vaso de vidrio de la vela se sobrecalentó y explotó, esparciendo cera caliente y fuego sobre las cortinas. Despertó por el humo y tuvo que usar el extintor, perdiendo la mesa y dañando la pared de su habitación.`,
          `**El humidificador que pudrió la madera**: Sergio compró un difusor de aire económico. El sistema de goteo ultrasónico falló y comenzó a condensar agua en lugar de evaporarla. Al cabo de una semana, la humedad acumulada pudrió la superficie de su cómoda de roble heredada, dejándole una mancha negra insalvable.`,
          `**La lámpara cortocircuito**: María compró una lámpara decorativa de noche. A la tercera noche de uso, la fuente de alimentación interna de mala calidad se derritió, llenando la habitación de un humo tóxico con olor a plástico quemado y haciendo saltar los fusibles de toda la casa.`
        ],
        skepticism: "Moderado. Saben que muchas fotos de decoración están ultra-estilizadas con iluminación profesional, por lo que buscan videos en vivo del producto funcionando antes de comprar."
      },
      secrets: {
        historical: "En la antigüedad, las culturas asiáticas y mediterráneas utilizaban braseros de barro con esencias naturales y aceites esenciales no solo para perfumar, sino para purificar el aire y calmar el sistema nervioso de los gobernantes en tiempos de guerra. El fuego visual y la aromaterapia eran considerados medicina sagrada para el alma estresada.",
        conspiracy: "Las compañías de ambientadores químicos de enchufe ocultan que sus productos contienen ftalatos y toxinas que alteran tus hormonas. Promueven que el aroma sintético es limpio, cuando en realidad contamina tu hogar para ahorrar costes de esencias naturales.",
        mechanismProblem: "El estrés moderno bloquea la producción de melatonina y mantiene el cerebro en estado de alerta constante debido a la luz azul artificial y al aire seco y viciado de los interiores modernos.",
        mechanismSolution: `${formattedName} combina la atomización ultrasónica de aceites esenciales puros para rehidratar el aire con un espectro de luz cálida de simulación orgánica que engaña al cerebro para liberar dopamina y melatonina al instante, induciendo relajación profunda.`
      },
      eden: {
        goldenAge: "Antes de la urbanización masiva, las familias pasaban las noches reunidas alrededor de chimeneas de leña real, respirando aire limpio con aromas de pino y tierra húmeda, lo que regulaba su ritmo circadiano de forma natural.",
        corruptor: "La llegada del aire acondicionado seco, las luces fluorescentes de oficina y los ambientadores químicos artificiales desconectaron nuestros sentidos de la naturaleza, provocando fatiga crónica y migrañas.",
        contrast: "Las comunidades nórdicas que practican el concepto de 'Hygge' en invierno reportan niveles extremadamente bajos de depresión estacional. Su secreto es el uso de iluminación ambiental orgánica, aromas naturales y la creación de santuarios acogedores dentro de casa."
      },
      verbatims: [
        "Llego del trabajo tan estresada que siento que mi casa no me deja relajarme.",
        "Compré un difusor barato y a las dos semanas empezó a hacer un ruido horrible que no me deja dormir.",
        "Odio los aerosoles de supermercado, huelen a desinfectante químico de hospital.",
        "Me da miedo dejar velas encendidas por si mi gato las tira y causa un incendio.",
        "Quiero que mi sala se sienta acogedora e instagrameable pero no tengo presupuesto para remodelar.",
        "El humidificador que compré es imposible de limpiar por dentro y ya tiene manchas negras de moho.",
        "Tengo el sueño tan ligero que cualquier luz de stand-by o zumbido me despierta.",
        "Compré una lámpara decorativa y cuando llegó parecía plástico barato de bazar.",
        "El aire de mi habitación se siente tan seco en invierno que me levanto con la garganta irritada.",
        "Solo quiero un rincón en mi casa donde pueda desconectar del teléfono y relajarme.",
        "Mi anterior difusor de aroma arruinó el barniz de mi mesa de madera favorita por fugas de agua.",
        "Me encanta la idea de tener una chimenea pero vivo en un apartamento pequeño sin salida de humo.",
        "Esta luz LED de noche es tan blanca y fría que me quita el sueño en vez de ayudarme a dormir.",
        "Todos los humidificadores del mercado parecen aparatos médicos de hospital, son horribles.",
        "Gastar dinero en velas caras que duran 20 horas me parece tirar la plata a la basura."
      ],
      avatar: {
        age: "28 a 48 años",
        gender: "Femenino (70%) / Masculino (30%)",
        location: "Ciudades principales, apartamentos alquilados y casas unifamiliares modernas",
        income: "$1,800 a $4,200 USD mensuales",
        background: "Diseñadoras, arquitectas, programadoras, oficinistas de corporaciones, profesionales de recursos humanos e influencers de estilo de vida.",
        identities: "Entusiastas del diseño de interiores minimalista, personas que trabajan desde casa y buscan un ambiente libre de estrés (Home Office).",
        painPoints: {
          p1: { name: "Estrés y sobrecarga sensorial diaria", list: ["Dificultad para relajarse después de 8 horas de pantalla", "Tensión muscular y mental al ingresar a la casa", "Zumbidos de ruido de fondo de electrodomésticos"] },
          p2: { name: "Aire de interior seco e irritante", list: ["Garganta seca y tos matutina por el calefactor o AC", "Fugas de agua de humidificadores de mala calidad", "Alergias debido a polvo y falta de humedad óptima"] },
          p3: { name: "Aromas sintéticos tóxicos para el hogar", list: ["Migrañas causadas por aerosoles y ambientadores de enchufe", "Miedo a incendios por dejar velas encendidas solas", "Gasto repetitivo e insostenible en velas de cera de soja de corta duración"] }
        },
        goals: {
          short: ["Lograr un aroma fresco y natural en la sala en 5 minutos", "Tener una luz cálida y relajante para leer antes de dormir", "Mantener la mesa libre de fugas de agua y humedad molesta"],
          long: ["Crear un 'santuario de paz' dentro de casa para desconectarse", "Eliminar los químicos y ambientadores tóxicos de la rutina familiar", "Mejorar la calidad del sueño profundo sin usar pastillas para dormir"]
        },
        emotionalDrivers: [
          "La necesidad imperiosa de desconectarse visual y mentalmente al terminar su jornada de trabajo.",
          "El orgullo de invitar a amigos a casa y que se sorprendan por el diseño estético y el aroma premium.",
          "El deseo de crear un entorno seguro, limpio y libre de tóxicos para sus hijos y mascotas."
        ],
        quotes: {
          general: [
            "Mi hogar debería sentirse como un refugio de paz, pero a veces el caos del trabajo se queda en el aire.",
            "Quiero que mi sala huela delicioso de forma natural, no a perfume de hospital barato.",
            "Me encanta la luz del fuego, me calma de inmediato al final del día."
          ],
          pain: [
            "Dejé un humidificador encendido y cuando volví me había arruinado el acabado de la cómoda de madera.",
            "Los aerosoles comunes me dan un dolor de cabeza inmediato y a mi perro le dan estornudos.",
            "Casi provoco un incendio por quedarme dormida con una vela aromática encendida."
          ],
          mindset: [
            "La forma en que decoramos y perfumamos nuestro hogar define nuestra paz mental diaria.",
            "Los ambientadores sintéticos son un veneno invisible que nos venden como limpieza.",
            "Prefiero invertir en un dispositivo estético y duradero que seguir tirando dinero en velas baratas."
          ],
          emotional: [
            "Siento que nunca puedo apagar mi mente, mi cabeza sigue dando vueltas a los correos incluso en la cama.",
            "Me da vergüenza cuando vienen visitas y mi casa huele a cerrado o a la comida que preparé al mediodía.",
            "Ver una llama de fuego bailar me relaja más que cualquier aplicación de meditación en el celular."
          ],
          responses: [
            "Compro velas perfumadas caras que duran dos días y me siento culpable por gastar tanto.",
            "Usaba difusores médicos blancos feos que arruinaban por completo la decoración minimalista de mi sala.",
            "Prendo luces artificiales de techo muy fuertes en la noche que solo me quitan el sueño."
          ],
          success: [
            "Quiero entrar a mi hogar, respirar profundo y sentir que el estrés del día se evapora al instante.",
            "Mi meta es tener un rincón de lectura perfecto, acogedor y que se vea increíble en fotos.",
            "El éxito es saber que mi familia respira aire limpio y puro sin tóxicos hormonales."
          ]
        },
        fears: [
          "Provocar un cortocircuito o incendio grave por dejar un humidificador barato encendido de noche.",
          "Que los aceites y la humedad manchen o pudran las paredes de yeso o muebles caros de madera.",
          "Desarrollar problemas respiratorios a largo plazo por inhalar ambientadores químicos sintéticos."
        ],
        insights: [
          "El comprador de productos del hogar compra un 'estado de ánimo' (relajación, estatus) y no solo un adorno.",
          "La estética visual 'aesthetic' (compartible en Instagram/TikTok) es el principal activador de la compra por impulso.",
          "Explicar el peligro de los ftalatos en ambientadores tradicionales aumenta la urgencia de compra."
        ],
        journey: {
          awareness: "El usuario se siente estresado al llegar a casa y nota que el aire de su habitación es seco y huele a cerrado.",
          frustración: "Gasta dinero en velas caras que duran poco o humidificadores plásticos feos que gotean y se pudren de moho.",
          desesperación: "Busca en blogs de diseño y redes sociales ideas para crear un ambiente acogedor (Hygge) y aromaterapia segura.",
          alivio: "Compra el humidificador de simulación orgánica, experimenta la paz de la luz cálida y el aroma constante sin riesgos."
        }
      },
      offer: {
        names: ["VolcanoMist Diffuser", "AuraFlame Ambient Humidifier", "HyggeGlow Flame Diffuser"],
        awareness: "Consciente de la solución (Conoce los humidificadores comunes, pero no sabe que este tiene un efecto de llama real y decorativo).",
        sophistication: "Nivel 3 (Mercado lleno de difusores plásticos de farmacia; se requiere destacar el 'Wow Factor' visual de la llama y la seguridad).",
        bigIdea: "El difusor ultrasónico con 'Llama Fría' que humedece tu hogar y drena el estrés diario sin peligro de incendio.",
        metaphor: "Una chimenea de lujo portátil y aromática para tu mesa de noche.",
        ump: "El aire viciado y seco de los interiores urbanos. Los sistemas de aire acondicionado y calefacción resecan las vías respiratorias e inflaman el sistema nervioso, agravando el cortisol y el insomnio.",
        ums: "Evaporación ultrasónica que rompe las moléculas de agua y aceites esenciales en una micro-niebla fría, iluminada por LEDs naranjas/azules de espectro cálido para crear una llama simulada 100% segura al tacto.",
        guru: "Un terapeuta de spa holístico experto en el diseño de entornos de relajación para hoteles de 5 estrellas.",
        discovery: "Descubierto al diseñar simuladores de fuego para teatros que necesitaban un efecto realista de chimenea sin calor para proteger a los actores del humo tóxico.",
        product: "Humidificador difusor ultrasónico con luces LED de simulación de fuego, capacidad de 200ml y apagado automático.",
        headlines: [
          "La Chimenea De Llama Fría Que Convierte Tu Habitación En Un Santuario De Relajación",
          "¿Aire Seco Y Estrés Al Volver De Trabajar? El Hack De Aromaterapia Ultrasónica Que Calma Tu Mente",
          "Por Qué Las Velas Aromáticas Pueden Ser Un Peligro Invisible En Tu Mesa De Noche: La Solución De ${formattedName}"
        ],
        objections: [
          "¿Eso se calienta? ¿Es peligroso para niños o gatos? (Respuesta: No, la llama es 100% vapor de agua frío, totalmente seguro al tacto).",
          "¿Va a mojar mi mesa o piso? (Respuesta: La tecnología ultrasónica crea una niebla seca que se evapora en el aire sin condensación).",
          "Hace mucho ruido para dormir. (Respuesta: Motor ultra-silencioso de menos de 24dB, imperceptible al oído humano).",
          "¿Se puede usar sin esencias aromáticas? (Respuesta: Sí, funciona perfectamente como humidificador de aire puro para dormir)."
        ],
        beliefs: [
          "Que el hogar debe ser un santuario de descompresión libre del caos de la oficina.",
          "Que respirar aire con humedad calibrada evita irritaciones de garganta y mejora la piel.",
          "Que los ambientadores químicos tradicionales dañan la salud pulmonar y deben ser reemplazados."
        ],
        funnel: "Video viral en TikTok mostrando el 'efecto volcán' en la oscuridad -> Landing page minimalista con enfoque en paz mental y aromaterapia -> Descuento especial del 40% por tiempo limitado -> Checkout directo.",
        domains: ["volcanomist.com", "auraflamehome.store", "hyggeglow.co"]
      }
    },
    tech: {
      demographics: {
        who: "Jóvenes profesionales, estudiantes universitarios, gamers, entusiastas de la tecnología e informática y personas interesadas en la productividad y la domótica (18-40 años, mayormente masculino, ingresos medios a altos).",
        attitudes: "Son amantes de la innovación, la velocidad y la optimización de procesos. Siguen foros como Reddit (r/gadgets, r/battlestations), ven canales de YouTube de reviews técnicas y comparan especificaciones al detalle.",
        dreams: "Tener el setup de trabajo o juego más eficiente, moderno y estéticamente futurista posible. Quieren automatizar sus tareas diarias para ahorrar tiempo y lucir a la vanguardia de la tecnología ante sus amigos.",
        defeats: "Han comprado gadgets chinos baratos que prometían ser revolucionarios pero tenían baterías que duraban 10 minutos, software con fallos constantes o se desconectaban del Wi-Fi cada hora.",
        outsideForces: "Culpan a las grandes corporaciones de tecnología (como Apple o Samsung) por practicar la obsolescencia programada para obligarles a comprar nuevos modelos cada año a precios inflados.",
        prejudices: "Tienen prejuicios contra los productos analógicos tradicionales (los ven como ineficientes y lentos) y contra las personas que no entienden de tecnología o usan cables desordenados en sus escritorios.",
        belief: "Creen que la tecnología bien integrada es la clave para la libertad de tiempo y la productividad máxima, y que un buen hardware define la calidad del trabajo y el entretenimiento digital moderno."
      },
      solutions: {
        current: "Cables y adaptadores múltiples, cargadores genéricos de pared, lámparas de escritorio estándar, o sitemas de sonido antiguos con cables molestos.",
        experience: "Luchan contra el desorden de cables en el escritorio, sufren por la falta de puertos en sus dispositivos modernos y lidian con la lentitud de carga de los equipos baratos.",
        likes: "Aman los diseños minimalistas de aluminio, la carga rápida inalámbrica, la compatibilidad universal de puertos y la iluminación RGB personalizable.",
        dislikes: "Detestan las conexiones bluetooth inestables, las luces de carga ultra-brillantes que no se pueden apagar en la noche y los transformadores gigantescos que tapan otros enchufes.",
        horrorStories: [
          `**El cargador que quemó la placa madre**: Alex conectó su laptop a un hub/cargador multipuerto económico. El dispositivo sufrió un pico de tensión interna por falta de regulador. A los 5 segundos, olió a quemado y su computador de $1,500 se apagó para siempre con la placa madre frita.`,
          `**Los auriculares con batería inflamada**: Daniel dejó cargando sus auriculares inalámbricos baratos durante la noche. Despertó con un olor químico dulce y descubrió que la batería de litio se había inflado tanto que explotó la carcasa plástica, quemando su mesa de noche.`,
          `**El soporte inteligente que tiró el monitor**: Mateo compró un brazo de soporte para monitor mecánico económico. Mientras jugaba, el metal de la base se venció por la fatiga de material, desplomando su pantalla curva de 34 pulgadas contra el teclado y rompiendo el panel LCD.`
        ],
        skepticism: "Altísimo. Conocen todos los trucos de dropshipping de AliExpress, por lo que exigen especificaciones reales (mAh reales, velocidades de transferencia USB reales) y manuales de usuario bien escritos."
      },
      secrets: {
        historical: "El origen de la computación limpia y sin cables se remonta a las patentes perdidas de Nikola Tesla sobre transmisión inalámbrica de energía a inicios del siglo XX. Las patentes fueron compradas y archivadas por magnates del cobre y el carbón para forzar al mundo a usar cables de cobre costosos durante los siguientes 100 años.",
        conspiracy: "Las marcas líderes de tecnología no lanzan dispositivos todo-en-uno eficientes porque ganan más cobrándote $30 por cada adaptador y cable propietario que se rompe a los 6 meses de uso.",
        mechanismProblem: "El verdadero asesino de la productividad y los gadgets es el calor excesivo generado por cargadores ineficientes y la acumulación de cables que bloquea el flujo magnético y de aire en el escritorio.",
        mechanismSolution: `${formattedName} integra una arquitectura de disipación de calor inteligente y bobinas magnéticas universales avanzadas que cargan y conectan múltiples dispositivos a máxima velocidad sin acumular calor ni cables.`
      },
      eden: {
        goldenAge: "Antes de la hiperconexión forzada de cables propietarios y cargadores individuales por cada gadget, el espacio de trabajo era limpio y libre de ruido electromagnético y visual.",
        corruptor: "La decisión corporativa de eliminar cargadores de las cajas de teléfonos y vender puertos limitados en laptops nos obligó a comprar decenas de dongles y adaptadores de mala calidad.",
        contrast: "Los diseñadores y desarrolladores de setups minimalistas en Japón reportan un 40% más de concentración y menos dolores de cabeza. Su secreto es el concepto 'Zero-Cable', usando bases de carga integradas y luz indirecta regulable."
      },
      verbatims: [
        "Mi escritorio parece un nido de serpientes por la cantidad de cables tirados.",
        "Compré un hub USB de $15 y dejó de transferir datos a la semana, solo sirve para cargar lento.",
        "Odio tener que llevar 4 cargadores diferentes en mi mochila cuando salgo a trabajar.",
        "Esta batería portátil de 20,000 mAh en realidad solo me carga el teléfono una vez, es una estafa.",
        "Los cables de Apple se rompen de solo mirarlos por la base.",
        "Se me quemó la laptop por un pico de energía en un adaptador de mala calidad.",
        "Quiero un setup limpio y estético como los que se ven en Reddit pero sin gastar miles de dólares.",
        "El bluetooth de estos auriculares se desconecta cada vez que me alejo dos metros del teléfono.",
        "Este cargador inalámbrico calienta tanto el celular que me da miedo que explote la batería.",
        "Harto de las marcas que te cobran $40 por un cargador que debería venir incluido.",
        "No tengo suficientes enchufes cerca de mi escritorio para todos mis dispositivos.",
        "Este gadget inteligente dejó de conectarse a la red porque la app no es compatible con el nuevo iOS.",
        "El puerto USB-C de mi cargador se soltó por dentro y ahora tengo que buscarle la posición para que cargue.",
        "La luz de carga de esta batería brilla tanto de noche que parece una discoteca en mi cuarto.",
        "Solo quiero algo que funcione rápido, que no falle y que limpie el desorden de mi mesa."
      ],
      avatar: {
        age: "18 a 38 años",
        gender: "Masculino (75%) / Femenino (25%)",
        location: "Zonas metropolitanas, cuartos universitarios y oficinas de teletrabajo",
        income: "$2,000 a $5,500 USD mensuales",
        background: "Ingenieros de software, analistas de datos, estudiantes de TI, diseñadores web, gamers y creadores de contenido técnico.",
        identities: "Entusiastas del hardware ('techies'), personas obsesionadas con la ergonomía y la productividad en su escritorio (Desk Setup).",
        painPoints: {
          p1: { name: "Desorden crónico de cables (Cable Chaos)", list: ["Falta de enchufes para laptop, móvil y auriculares", "Cables enredados que arruinan la estética del escritorio", "Rotura constante del conector del cable por flexión"] },
          p2: { name: "Lentitud de carga y hubs inestables", list: ["Hubs que se desconectan solos a mitad de una transferencia", "Cargadores que calientan en exceso los dispositivos", "Pérdida de velocidad en puertos de carga inalámbricos"] },
          p3: { name: "Pérdida de productividad por fallos técnicos", list: ["Baterías portátiles que mienten sobre sus mAh reales", "Gadgets con software inestable que requieren reinicio", "Obsolescencia programada de cables propietarios caros"] }
        },
        goals: {
          short: ["Cargar tres dispositivos de forma rápida con un solo cable", "Eliminar los transformadores gigantes del tomacorriente", "Tener un cargador estético que combine con su setup"],
          long: ["Construir un escritorio con cables cero (Clean BattleStation)", "Proteger la vida útil de las baterías de litio caras", "Ahorrar dinero evitando comprar adaptadores propietarios anuales"]
        },
        emotionalDrivers: [
          "La obsesión por el minimalismo estético y la simetría visual en su espacio de trabajo diario.",
          "La satisfacción de tener un setup que luzca futurista y premium ante su comunidad de Reddit.",
          "La frustración de perder tiempo buscando el cable correcto antes de una reunión importante."
        ],
        quotes: {
          general: [
            "Quiero que mi espacio de trabajo sea eficiente, rápido y libre de enredos de cables inútiles.",
            "La tecnología debería simplificarnos la vida, no obligarnos a cargar con 5 adaptadores.",
            "Busco especificaciones técnicas reales, estoy cansado de las promesas de marketing chinas."
          ],
          pain: [
            "Conecté mi disco duro externo a un hub barato y me corrompió los datos por desconexión repentina.",
            "Mi cargador inalámbrico actual calienta mi celular tanto que la pantalla se apaga por seguridad.",
            "Gastar $35 en un adaptador de marca que debería venir incluido en la caja me parece un robo."
          ],
          mindset: [
            "La productividad comienza con un escritorio limpio y ordenado, el desorden visual bloquea la mente.",
            "Un buen hardware es una inversión a largo plazo en tu trabajo y tu paz mental diaria.",
            "Los cables son una reliquia del siglo pasado que deberíamos haber eliminado hace años."
          ],
          emotional: [
            "Me da vergüenza mostrar fotos de mi setup gamer en internet por el desorden de cables bajo la mesa.",
            "Me estresa ver tantos transformadores enchufados en la zapatilla eléctrica, parece que va a explotar.",
            "Siento que pierdo el control de mi tiempo cuando mi teléfono se queda sin batería en medio de un viaje."
          ],
          responses: [
            "Compro hubs de $10 que se rompen al mes y me dejan sin puertos USB en la laptop.",
            "Lleno los cajones con cargadores viejos que cargan a paso de tortuga y no sirven para equipos modernos.",
            "Tengo que pegar los cables con cinta al borde del escritorio para que no se caigan al suelo."
          ],
          success: [
            "El éxito es armar mi mochila para viajar con un solo cargador universal ultraligero.",
            "Quiero entrar a mi oficina digital y sentir que estoy en el año 2030, todo optimizado y limpio.",
            "Mi meta es ver mi teléfono y laptop cargados al 100% en menos de 45 minutos sin calentar."
          ]
        },
        fears: [
          "Fruir la placa madre de su laptop de $2,000 debido a un corto en un adaptador defectuoso.",
          "Provocar la degradación química de la batería de su celular de gama alta por exceso de calor.",
          "Quedarse incomunicado en medio de un viaje importante de negocios por falla de energía."
        ],
        insights: [
          "El avatar compra basado en tablas comparativas de especificaciones y rendimiento real.",
          "El color negro mate, materiales de aluminio y diseño geométrico aumentan el valor percibido del producto.",
          "La garantía técnica de protección contra sobretensiones es un argumento de cierre de venta clave."
        ],
        journey: {
          awareness: "El avatar nota que su productividad se reduce por la falta de puertos y el desorden de cables en su mesa de trabajo.",
          frustración: "Compra cargadores múltiples baratos que tardan horas en cargar y hacen ruidos eléctricos molestos de alta frecuencia.",
          desesperación: "Busca en foros especializados reviews sobre cargadores GaN y hubs todo-en-uno eficientes de alta velocidad.",
          alivio: "Utiliza el producto tecnológico GaN, limpia su espacio de trabajo y carga todos sus equipos a la velocidad óptima."
        }
      },
      offer: {
        names: ["GaN ChargeHub Pro", "HyperDock multi-cargador", "ZeroCable Base Station"],
        awareness: "Consciente del producto (Sabe que existen cargadores rápidos GaN, pero busca especificaciones de puertos reales).",
        sophistication: "Nivel 3 (Saturación de hubs y cargadores rápidos chinos; requiere demostrar la tecnología de nitruro de galio (GaN) y chip inteligente).",
        bigIdea: "El cargador GaN universal de 100W que reemplaza 4 transformadores y organiza tu escritorio al instante.",
        metaphor: "Una central de energía eléctrica de alta velocidad para tu escritorio del tamaño de un tarjetero.",
        ump: "La ineficiencia térmica y de silicio. Los cargadores comunes usan silicio antiguo que genera calor excesivo, desperdicia energía y limita el amperaje a baja velocidad.",
        ums: "Semiconductores de Nitruro de Galio (GaN) de última generación que manejan 5 veces más energía en la mitad de espacio, reduciendo el calor en 40% y canalizando carga inteligente regulada.",
        guru: "Un ex-diseñador de sistemas de energía electromagnética aeroespacial que optimizaba cargadores satelitales.",
        discovery: "Descubierto al adaptar los cargadores GaN utilizados en satélites de telecomunicaciones (donde el espacio y la temperatura son críticos) para el uso comercial de oficina.",
        product: "Cargador GaN de pared multi-puerto (3x USB-C + 1x USB-A) de 100W con regulador de picos de voltaje incorporado.",
        headlines: [
          "Cómo Reemplazar Los 4 Transformadores De Tu Escritorio Con Este Cargador GaN Del Tamaño De Una Tarjeta",
          "¿Setup Con Cables Enredados? El Hack GaN De 100W Que Carga Tu Laptop Y Móvil A Máxima Velocidad",
          "La Verdad Detrás De Los Cargadores Baratos: Cómo Evitar Fritar La Placa Madre De Tus Equipos"
        ],
        objections: [
          "¿Es compatible con mi laptop de marca específica? (Respuesta: Sí, es compatible con protocolos Power Delivery (PD) universales para cualquier marca).",
          "¿Me va a sobrecalentar el teléfono? (Respuesta: No, el microchip GaN regula el amperaje de forma dinámica según la carga del dispositivo).",
          "Es muy costoso en comparación con cargadores de pared estándar. (Respuesta: Reemplaza a 4 cargadores premium y protege tus equipos de picos de tensión).",
          "Los puertos se dañan rápido. (Respuesta: Puertos reforzados con núcleo de cobre chapado en oro para soportar más de 10,000 conexiones)."
        ],
        beliefs: [
          "Que los cargadores tradicionales son lentos, obsoletos e ineficientes térmicamente.",
          "Que invertir en un cargador regulado previene la destrucción de equipos costosos.",
          "Que un espacio de trabajo ordenado incrementa la concentración y velocidad laboral."
        ],
        funnel: "Anuncio de TikTok mostrando el antes y después del escritorio (Caos de cables vs Base limpia GaN) -> Ficha técnica interactiva en la landing -> Opción de añadir cables trenzados de alta durabilidad -> Pago rápido.",
        domains: ["ganchargehub.store", "zerocablepro.com", "hyperdockgan.co"]
      }
    },
    general: {
      demographics: {
        who: "Compradores en línea generales de entre 25 y 50 años que buscan soluciones prácticas, regalos novedosos o resolver problemas cotidianos con gadgets útiles e interesantes.",
        attitudes: "Tienen una mentalidad orientada a la practicidad y la curiosidad. Son usuarios frecuentes de redes sociales y compran por impulso si perciben un valor claro o un descuento atractivo.",
        dreams: "Hacer su vida diaria más cómoda y eficiente, reduciendo pequeñas frustraciones de la rutina. Buscan la satisfacción de encontrar 'hacks' inteligentes que les faciliten la vida.",
        defeats: "Han comprado artículos novedosos en línea que prometían cambiar sus vidas y resultaron ser de plástico frágil que terminó arrumbado en un cajón tras el primer uso.",
        outsideForces: "Culpan al ritmo acelerado de la vida moderna por no dejarles tiempo libre y a los fabricantes de productos desechables por no hacer cosas duraderas.",
        prejudices: "Tienen prejuicio contra los productos demasiado caros o de diseñador (los consideran estafas pretenciosas) y prefieren soluciones directas y utilitarias.",
        belief: "Crecieron con la idea de que siempre hay una forma más inteligente de hacer las cosas y que un pequeño gadget correcto puede ahorrarte horas de trabajo y frustración."
      },
      solutions: {
        current: "Productos manuales tradicionales, métodos improvisados caseros o herramientas baratas de ferretería local.",
        experience: "Lidian con la ineficiencia de métodos antiguos, pierden tiempo y energía y terminan frustrados con los resultados mediocres.",
        likes: "Valoran la simplicidad de uso, los resultados inmediatos y los diseños compactos fáciles de almacenar.",
        dislikes: "Detestan los manuales complicados en otros idiomas, los componentes difíciles de lavar y los productos que requieren baterías raras que no vienen incluidas.",
        horrorStories: [
          `**El accidente con el cortador multifunción**: Juan compró un rallador de verduras multifunción barato. Las cuchillas no tenían tope de seguridad. Al intentar rallar una zanahoria, el empujador se resbaló y se cortó la yema del dedo pulgar, requiriendo 6 puntos de sutura de emergencia.`,
          `**La percha que destruyó el armario**: Patricia compró organizadores de ropa colgantes supuestamente ultra-resistentes. El gancho de metal se abrió bajo el peso de 4 abrigos, cayendo sobre el estante de vidrio inferior de su armario y rompiéndolo en mil pedazos.`,
          `**El sellador que dañó la comida**: Diego usó un mini-sellador de bolsas a batería. El dispositivo sobrecalentó el plástico, derritiendo la bolsa de comida de su perro y mezclando plástico quemado con el alimento, lo que intoxicó a su mascota.`
        ],
        skepticism: "Medio. Buscan reseñas y demostraciones en video reales para convencerse de que el producto hace lo que promete en un entorno real."
      },
      secrets: {
        historical: "El concepto de optimizar las herramientas cotidianas se remonta a los gremios de artesanos del Renacimiento, que diseñaban utensilios personalizados para minimizar el esfuerzo muscular y maximizar la precisión. Con la producción en masa, se priorizó la reducción de costes, eliminando la ergonomía inteligente que hoy redescubrimos.",
        conspiracy: "Las tiendas minoristas físicas inflan los precios hasta un 300% para cubrir alquileres y personal. Ocultan que los mismos productos premium se pueden enviar directo del fabricante, haciéndote creer que el precio alto equivale a calidad.",
        mechanismProblem: "El verdadero obstáculo diario es la fricción en las tareas repetitivas (limpieza, cocina, organización), lo que causa un desgaste de energía mental silencioso acumulado durante el día.",
        mechanismSolution: `${formattedName} elimina esta fricción diaria gracias a su diseño patentado de alta eficiencia física que realiza el trabajo en la mitad de tiempo y con una fracción del esfuerzo físico.`
      },
      eden: {
        goldenAge: "Antes de la avalancha de productos desechables de un solo uso, las herramientas del hogar se hacían para durar toda la vida y se diseñaban con un propósito ergonómico claro y duradero.",
        corruptor: "La obsesión de la manufactura moderna por la obsolescencia programada y los materiales plásticos baratos redujo la vida útil de todo lo que compramos para el hogar.",
        contrast: "Las comunidades rurales tradicionales en Europa central usan utensilios de madera y metal forjado heredados durante generaciones, reportando cero frustración diaria en sus tareas domésticas básicas."
      },
      verbatims: [
        "Compré esto pensando que me ahorraría tiempo y tardé más en limpiarlo que lo que tardé en usarlo.",
        "Siento que mi rutina diaria está llena de pequeñas molestias que me ponen de mal humor.",
        "Harto de comprar cosas en línea que terminan pareciendo juguetes de plástico cuando llegan.",
        "Este manual de instrucciones está en un idioma incomprensible y con letras minúsculas.",
        "No tengo espacio en los cajones para guardar más trastos inútiles.",
        "Se rompió al primer uso, literalmente el plástico se venció de la nada.",
        "¿Por qué no hacen las cosas para que duren como antes?",
        "Gastar $40 en algo que solo hace una cosa no vale la pena.",
        "Tardé una hora en armarlo porque las piezas no encajaban bien.",
        "Tengo el cajón de la cocina lleno de gadgets que nunca uso porque son muy complicados.",
        "Solo quiero algo que me facilite esta tarea aburrida de todos los días.",
        "Me da miedo que este aparato eléctrico barato me cause un cortocircuito en casa.",
        "La publicidad lo hacía ver facilísimo, pero en la realidad es un desastre de usar.",
        "No viene con las baterías incluidas y ahora tengo que salir a buscar unas que no tengo.",
        "Esta herramienta manual me deja las manos llenas de ampollas si la uso más de 10 minutos."
      ],
      avatar: {
        age: "25 a 50 años",
        gender: "Femenino (55%) / Masculino (45%)",
        location: "Zonas urbanas y de clase media en general",
        income: "$1,500 a $3,500 USD mensuales",
        background: "Estudiantes, amas de casa, empleados de comercio, profesionales jóvenes e internautas ávidos de ofertas.",
        identities: "Personas ocupadas que valoran la eficiencia del tiempo y buscan soluciones rápidas para problemas prácticos diarios.",
        painPoints: {
          p1: { name: "Pérdida de tiempo en tareas repetitivas", list: ["Limpiar o preparar utensilios requiere demasiado esfuerzo", "Procedimientos manuales antiguos que cansan físicamente", "Acumulación de pequeños retrasos en la jornada diaria"] },
          p2: { name: "Productos desechables de corta duración", list: ["Herramientas baratas de plástico que se rompen al primer uso", "Manuales incomprensibles en otros idiomas y letra diminuta", "Dificultad para encontrar repuestos de baterías específicas"] },
          p3: { name: "Desorden y acumulación en el hogar", list: ["Cajones atestados de gadgets de una sola función inútiles", "Frustración por anuncios en video falsos que exageran el uso", "Espacios saturados por falta de herramientas universales"] }
        },
        goals: {
          short: ["Completar una tarea del hogar en la mitad del tiempo", "Entender el uso del producto de inmediato sin manuales complejos", "Tener una herramienta compacta y duradera fácil de guardar"],
          long: ["Simplificar la vida doméstica diaria y reducir el estrés doméstico", "Evitar el ciclo de compras constantes de productos desechables", "Tener un hogar limpio, ordenado y optimizado con pocos recursos"]
        },
        emotionalDrivers: [
          "El deseo de sentir que uno gestiona el tiempo en casa con inteligencia y modernidad.",
          "La frustración acumulada por pequeñas molestias repetitivas que arruinan el humor de la tarde.",
          "La pequeña victoria personal de descubrir un truco que soluciona un problema que otros consideran difícil."
        ],
        quotes: {
          general: [
            "Solo busco cosas prácticas que hagan lo que prometen y que no me compliquen más la vida.",
            "Me encanta descubrir gadgets ingeniosos que ahorran tiempo de verdad en la rutina.",
            "Detesto acumular cosas inútiles en las alacenas solo por marketing."
          ],
          pain: [
            "Compré un cortador y tardé más lavándolo de lo que tardé en usarlo, terminó en el fondo del cajón.",
            "El plástico de las herramientas modernas parece juguete de niños, se doblan a la primera fuerza.",
            "No entiendo cómo configurar esto, el manual parece traducido con un robot automático inútil."
          ],
          mindset: [
            "Siempre hay una manera más fácil y rápida de hacer las cosas si tienes la herramienta adecuada.",
            "El precio bajo a veces sale carísimo si tienes que volver a comprar el producto a los 15 días.",
            "La comodidad de tu hogar no tiene precio, pequeñas inversiones cambian tu día a día."
          ],
          emotional: [
            "Llego cansada del trabajo y tener que lidiar con problemas manuales del hogar me saca de mis casillas.",
            "Me da coraje gastar dinero en algo que termina roto o guardado porque era muy difícil de usar.",
            "Siento que mi cocina o mi baño está lleno de trastos inservibles y me genera desorden mental."
          ],
          responses: [
            "Uso métodos improvisados con cuchillos o trapos que a veces me causan pequeños cortes o accidentes.",
            "Dejo las tareas domésticas sin hacer durante días por pereza de usar equipos complicados.",
            "Termino comprando productos de televenta baratos que sé que no van a durar por pura curiosidad."
          ],
          success: [
            "El éxito es terminar la limpieza o la tarea del hogar rápido y tener tiempo libre para relajarme.",
            "Quiero que mi hogar funcione de forma óptima y eficiente sin cables ni enredos innecesarios.",
            "Quiero un producto que mi abuela y mi hijo puedan usar sin necesidad de explicaciones."
          ]
        },
        fears: [
          "Sufrir un accidente físico menor (corte, quemadura o golpe) por falla de materiales de un gadget.",
          "Darse cuenta de que tiró el dinero en una estafa más de internet con videos falsificados.",
          "Dañar otras superficies del hogar (mesadas, paredes) por usar herramientas inapropiadas."
        ],
        insights: [
          "El avatar compra basado en el 'Wow factor' del video publicitario que demuestra la solución en 5 segundos.",
          "El empaque y la garantía de reembolso inmediato reducen la resistencia a la compra de marcas desconocidas.",
          "Presentar el producto como una herramienta multiusos compacta soluciona la objeción de falta de espacio."
        ],
        journey: {
          awareness: "El avatar experimenta frustración por el tiempo perdido en tareas domésticas aburridas o repetitivas.",
          frustración: "Compra gadgets genéricos que resultan frágiles, difíciles de lavar o incomprensibles de configurar.",
          desesperación: "Busca en foros y redes sociales recomendaciones de herramientas duraderas, prácticas y multifuncionales.",
          alivio: "Prueba el producto, completa la tarea en minutos con una sola mano y lo añade a sus herramientas diarias."
        }
      },
      offer: {
        names: ["FlexiTool Multi-Cutter", "EcoClean Pro Wand", "SmartHelper Guard"],
        awareness: "Consciente del problema (Sabe qué tarea le molesta realizar, pero no sabe qué producto la automatiza).",
        sophistication: "Nivel 2 (Competencia con herramientas manuales comunes; se destaca por su versatilidad y materiales reforzados).",
        bigIdea: "La herramienta compacta de alta eficiencia que resuelve 3 tareas cotidianas en la mitad de tiempo.",
        metaphor: "La navaja suiza moderna para las tareas domésticas de tu hogar.",
        ump: "El desgaste del diseño utilitario. Las herramientas normales se diseñan baratas para romperse rápido y obligarte a comprar más, descuidando el agarre físico y la durabilidad del filo/motor.",
        ums: "Diseño ergonómico de una sola pieza en acero inoxidable quirúrgico y polímeros reforzados de alta durabilidad adaptado para maximizar la palanca física con el mínimo esfuerzo.",
        guru: "Un organizador profesional de hogares enfocado en optimizar espacios de viviendas compactas urbanas.",
        discovery: "Descubierto al observar cómo los carpinteros y cocineros tradicionales modificaban sus propias herramientas manuales para evitar la fatiga crónica en las manos durante jornadas largas.",
        product: "Herramienta ergonómica multifuncional con mangos antideslizantes y hojas intercambiables de alta resistencia.",
        headlines: [
          "Cómo Completar Las Tareas Más Aburridas Del Hogar En La Mitad De Tiempo Y Con La Mitad De Esfuerzo",
          "La Navaja Suiza Doméstica Que Reemplaza 3 Trastos Del Cajón Y Dura Toda La Vida",
          "¿Herramientas De Plástico Que Se Rompen? La Solución Ortopédica Reforzada De ${formattedName}"
        ],
        objections: [
          "¿Se va a romper al primer esfuerzo fuerte? (Respuesta: Estructura de acero templado y ABS industrial garantizada de por vida).",
          "Es difícil de lavar o guardar. (Respuesta: Diseño apto para lavavajillas y colgador magnético compacto integrado).",
          "¿Realmente se usa todos los días? (Respuesta: Reemplaza tareas obligatorias cotidianas como corte, soporte o limpieza básica).",
          "El manual viene en inglés. (Respuesta: Incluye manual físico en español con ilustraciones paso a paso y video tutorial QR)."
        ],
        beliefs: [
          "Que las tareas domésticas no tienen por qué ser dolorosas ni demandar todo tu tiempo libre.",
          "Que vale más comprar un producto reforzado una vez que herramientas baratas de bazar cada mes.",
          "Que un espacio sin cacharros inútiles mejora la comodidad y el orden mental familiar."
        ],
        funnel: "Video demostrativo ultra-rápido en TikTok con efecto satisfactorio (satisfying loop) -> Landing page directa orientada a resolver el problema -> Oferta Paga 1 Lleva 2 para regalar -> Checkout simplificado.",
        domains: ["flexitoolsmart.com", "ecocleanwand.store", "smarthelper.co"]
      }
    }
  };

  const templates = categoryTemplates[categoryId] || categoryTemplates.general;

  // Render variables inside template content
  const compiledDemographics = {
    who: templates.demographics.who.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    attitudes: templates.demographics.attitudes.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    dreams: templates.demographics.dreams.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    defeats: templates.demographics.defeats.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    outsideForces: templates.demographics.outsideForces.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    prejudices: templates.demographics.prejudices.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    belief: templates.demographics.belief.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)
  };

  const compiledSolutions = {
    current: templates.solutions.current.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    experience: templates.solutions.experience.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    likes: templates.solutions.likes.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    dislikes: templates.solutions.dislikes.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    horrorStories: templates.solutions.horrorStories.map(story => story.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
    skepticism: templates.solutions.skepticism.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)
  };

  const compiledSecrets = {
    historical: templates.secrets.historical.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    conspiracy: templates.secrets.conspiracy.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    mechanismProblem: templates.secrets.mechanismProblem.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    mechanismSolution: templates.secrets.mechanismSolution.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)
  };

  const compiledEden = {
    goldenAge: templates.eden.goldenAge.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    corruptor: templates.eden.corruptor.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
    contrast: templates.eden.contrast.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)
  };

  const compiledVerbatims = templates.verbatims.map(quote => quote.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName));

  // Generate 5 specific Copywriting Angles & Hooks
  const compiledAngles = [
    {
      title: "1. Ángulo de la Conspiración y la Supresión Industrial",
      narrative: `Centrado en desenmascarar cómo el lobby de las multinacionales tradicionales oculta la efectividad de los mecanismos naturales integrados en ${formattedName} para seguir vendiendo soluciones temporales extremadamente lucrativas.`,
      hook: `¿Sabías que las grandes marcas no quieren que conozcas este dispositivo? Prefieren cobrarte $100 al mes en suscripciones o tratamientos ineficaces. Descubre por qué ${formattedName} es el secreto que quieren ocultar.`,
      headline: `Lo Que "Ellos" No Quieren Que Sepas: La Verdad Detrás de ${formattedName} y Cómo las Corporaciones Han Ocultado Este Hack Durante Años`
    },
    {
      title: "2. Ángulo del Descubrimiento Olvidado (Sabiduría Antigua)",
      narrative: `Toma como base los remedios ancestrales (pre-1960) y las técnicas de los antiguos artesanos para presentar a ${formattedName} como el redescubrimiento científico de una tecnología olvidada, refinada con ingeniería moderna.`,
      hook: `¿Qué tenían en común los sanadores del antiguo Egipto y los astronautas modernos? El secreto físico detrás de ${formattedName}. Mira cómo redescubrimos esta tecnología olvidada y la trajimos al 2026.`,
      headline: `El Secreto Pre-1960 Redescubierto: Cómo una Tecnología Olvidada del Siglo Pasado Ha Sido Integrada en el Nuevo ${formattedName}`
    },
    {
      title: "3. Ángulo de la Frustración Empática (Psicología Estilo 'Tina')",
      narrative: `Apela directamente al dolor social, a la culpa silenciosa de fallar constantemente, a la falta de apoyo familiar y al deseo profundo de validación y orgullo ante los seres queridos (esposo, hermana, amigos).`,
      hook: `Con cada intento fallido, sentía que decepcionaba a mi familia... Sentía la culpa con cada bocado y el escepticismo de mis seres queridos. Hasta que descubrí ${formattedName} y todo cambió. Esta es mi historia real.`,
      headline: `"Con Cada Intento Fallido, Sentía Que Los Decepcionaba...": Cómo ${formattedName} Devolvió la Confianza y la Paz a un Hogar que Estaba a Punto de Rendirse`
    },
    {
      title: "4. Ángulo del 'Mecanismo Biológico / Físico Simple' (Biohacking)",
      narrative: `Explica de forma ultra-sencilla (nivel de 7º grado de lectura) la verdadera causa biológica o física del problema y cómo ${formattedName} funciona como el 'interruptor' que soluciona la causa raíz al instante sin esfuerzo.`,
      hook: `Deja de tratar los síntomas. El verdadero origen de tu frustración está en la compresión de este micro-canal en tu cuerpo. Mira cómo ${formattedName} lo desactiva en solo 3 minutos de forma lógica y segura.`,
      headline: `El 'Interruptor' de 3 Minutos: La Ciencia Detrás de ${formattedName} Explicada de Forma Tan Sencilla Que Hasta un Niño de 12 Años la Comprende`
    },
    {
      title: "5. Ángulo del Contraste Ancestral contra la Corrupción Moderna",
      narrative: `Establece un violento contraste entre el estilo de vida de tribus tradicionales (que nunca sufren este problema) y nuestra rutina urbana sedentaria, presentando al producto como la única forma de reestablecer el equilibrio.`,
      hook: `Los agricultores de la tribu Hunza viven hasta los 80 años sin este dolor. ¿Por qué nosotros sí? Por la corrupción del estilo de vida moderno. Descubre cómo traer la salud ancestral a tu casa con ${formattedName}.`,
      headline: `Volver al Edén: Cómo el Nuevo ${formattedName} Combate la Corrupción de la Vida Moderna y Restaura el Equilibrio Físico Ancestral`
    }
  ];

  // Helper variables for avatar mapping
  const av = templates.avatar;
  
  // Dynamic replacement of product names in avatar and offer briefs
  const compiledAvatarBrief = {
    general: {
      age: av.age,
      gender: av.gender,
      location: av.location,
      income: av.income,
      background: av.background.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
      identities: av.identities.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)
    },
    painPoints: {
      p1: { name: av.painPoints.p1.name, list: av.painPoints.p1.list.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)) },
      p2: { name: av.painPoints.p2.name, list: av.painPoints.p2.list.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)) },
      p3: { name: av.painPoints.p3.name, list: av.painPoints.p3.list.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)) }
    },
    goals: {
      short: av.goals.short.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
      long: av.goals.long.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName))
    },
    emotionalDrivers: av.emotionalDrivers.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
    quotes: {
      general: av.quotes.general.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
      pain: av.quotes.pain.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
      mindset: av.quotes.mindset.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
      emotional: av.quotes.emotional.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
      responses: av.quotes.responses.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
      success: av.quotes.success.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName))
    },
    fears: av.fears.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
    insights: av.insights.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)),
    journey: {
      awareness: av.journey.awareness.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
      frustración: av.journey.frustración.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
      desesperación: av.journey.desesperación.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName),
      alivio: av.journey.alivio.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName)
    }
  };

  const ob = templates.offer;

  const compiledOfferBrief = {
    names: ob.names.map(s => s.replace(/\${formattedName}/g, formattedName)),
    awareness: ob.awareness,
    sophistication: ob.sophistication,
    bigIdea: ob.bigIdea.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName),
    metaphor: ob.metaphor.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName),
    ump: ob.ump.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName),
    ums: ob.ums.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName),
    guru: ob.guru,
    discovery: ob.discovery.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName),
    product: ob.product.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName),
    headlines: ob.headlines.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName)),
    objections: ob.objections.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName)),
    beliefs: ob.beliefs.map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName)),
    funnel: ob.funnel.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName),
    domains: ob.domains,
    swipes: (ob.swipes || [
      `¡Atención! Si sufres por culpa de la inactividad de tu cuerpo, descubre el secreto de ${formattedName} hoy mismo.`,
      `¿Cansado de soluciones que no funcionan? El nuevo ${formattedName} activa tu flujo interno en 3 minutos.`,
      `El método definitivo que los profesionales recomiendan para combatir los desafíos diarios sin gastar una fortuna.`
    ]).map(s => s.replace(/\[NOMBRE_DEL_PRODUCTO\]/g, formattedName).replace(/\${formattedName}/g, formattedName)),
    otherNotes: ob.otherNotes || `Este producto ${formattedName} tiene una alta viabilidad comercial en mercados latinos debido a su bajo costo de adquisición y su gran factor "Wow" en anuncios de redes sociales (TikTok/Meta). Se recomienda enfocar los anuncios en el Mecanismo Único de la Solución.`
  };

  // Generar UGC Scripts
  const compiledUgcScripts = [
    {
      title: "Script 1: Gancho de Curiosidad (Patrón de Interrupción)",
      duration: "30 segundos",
      scenes: [
        {
          time: "0:00-0:05",
          visual: `[Visual: Primer plano dramático de la cara del actor con expresión de shock o dolor al usar un producto viejo, cortando rápido a ${formattedName} con luces premium]`,
          audio: `¿Sabías que el 90% de los métodos para solucionar esto en realidad empeoran el problema? Este secreto cambió todo.`,
          text: "El gran mito revelado 🤫"
        },
        {
          time: "0:05-0:15",
          visual: `[Visual: El actor muestra cómo funciona ${formattedName} en su día a día. Tomas en cámara lenta con iluminación cálida y acercamiento detallado]`,
          audio: `No es cuestión de edad o de gastar miles en tratamientos. Todo se reduce a activar el flujo natural con esta tecnología.`,
          text: "Cómo funciona en 3 minutos ⚡"
        },
        {
          time: "0:15-0:30",
          visual: `[Visual: Captura de pantalla de la tienda con descuento especial de hoy, seguido por el actor sonriendo y sosteniendo el producto con confianza]`,
          audio: `Por eso las marcas tradicionales no quieren que lo conozcas. Consigue el tuyo hoy con 50% de descuento antes de que se agote.`,
          text: "50% OFF + Envío Gratis 📦"
        }
      ]
    },
    {
      title: "Script 2: El Enfoque del Dolor Empático",
      duration: "45 segundos",
      scenes: [
        {
          time: "0:00-0:10",
          visual: `[Visual: El actor mirando al espejo o frotándose con frustración. Pantalla con tono frío y música de misterio o tensión]`,
          audio: `Estaba harta de despertarme y sentir que nada funcionaba. Había gastado una fortuna en cremas y fajas inútiles...`,
          text: "Basta de tirar el dinero ❌"
        },
        {
          time: "0:10-0:25",
          visual: `[Visual: Transición brillante a tono cálido. El actor usando ${formattedName} con una gran sonrisa y demostrando su portabilidad]`,
          audio: `Hasta que encontré esto. Su tecnología activa las células profundas sin dolor y drena las toxinas acumuladas de inmediato.`,
          text: "El secreto del drenaje biológico ✨"
        },
        {
          time: "0:25-0:45",
          visual: `[Visual: El actor aplicando el producto y mostrando un primer plano de los resultados. Llamado a la acción con garantía en pantalla]`,
          audio: `Si quieres volver a tener la libertad de lucir bien y sentirte joven, haz clic abajo. Si no te funciona, te devuelven el dinero. Sin preguntas.`,
          text: "Pruébalo libre de riesgos de por vida 👇"
        }
      ]
    },
    {
      title: "Script 3: UMS vs UMP (Explicación del Mecanismo Único)",
      duration: "60 segundos",
      scenes: [
        {
          time: "0:00-0:15",
          visual: `[Visual: Animación simple en 2D o dibujo en pantalla que muestra cómo la gravedad y la fatiga comprimen y obstruyen las células]`,
          audio: `El verdadero enemigo es el sedentarismo celular. Las toxinas se acumulan y bloquean el oxígeno en los tejidos profundos, causando flacidez y dolor.`,
          text: "El enemigo oculto bajo la piel ⚠️"
        },
        {
          time: "0:15-0:35",
          visual: `[Visual: Primer plano de ${formattedName} vibrando y emitiendo una luz cálida suave mientras se desliza con suavidad]`,
          audio: `Las cremas no pueden penetrar ahí. Pero este dispositivo usa microvibraciones térmicas que empujan las toxinas directamente hacia los ganglios.`,
          text: "Descompresión ultrasónica activa 🌀"
        },
        {
          time: "0:35-0:60",
          visual: `[Visual: Tomas de testimonios felices usando el producto, terminando con un botón grande de Compra con Envío Gratis]`,
          audio: `Es un tratamiento profesional de spa comprimido para usar en casa. Deja de tratar los síntomas y cura la raíz del problema hoy mismo. Haz clic abajo.`,
          text: "Activa tu salud celular hoy 🛒"
        }
      ]
    }
  ];

  // Generar Landing Page Outline y Código HTML/Tailwind
  const compiledLandingPage = {
    outline: [
      {
        title: "Sección 1: Hero de Alta Conversión (Impacto Emocional)",
        desc: `Encabezado de interrupción de patrón: "${compiledOfferBrief.headlines[0]}". Subtítulo enfocado en la solución: "Descubre cómo ${formattedName} drena la fatiga acumulada en 3 minutos sin inyecciones ni tratamientos costosos". Botón principal animado en degradado con llamado a la acción directo.`
      },
      {
        title: "Sección 2: La Fricción / El Problema del Mercado",
        desc: `Explicación del Mecanismo Único del Problema (UMP): "${compiledOfferBrief.ump}". Ilustra el dolor diario del cliente y por qué las soluciones tradicionales (cremas baratas, masajes manuales, analgésicos) solo tapan los síntomas temporalmente.`
      },
      {
        title: "Sección 3: Presentando el Mecanismo de Solución (UMS)",
        desc: `Presentación visual de ${formattedName}. Mapeo de beneficios usando su UMS: "${compiledOfferBrief.ums}". Destaca el diseño térmico portátil, su recarga USB y su aleación hipoalergénica con íconos premium.`
      },
      {
        title: "Sección 4: Prueba Social y Testimonios Directos",
        desc: `Inclusión de 3 verbatims reales de la investigación para crear empatía profunda: "1. ${compiledVerbatims[0]}" / "2. ${compiledVerbatims[1]}" / "3. ${compiledVerbatims[2]}". Acompañado de avatares simulados de compradores felices.`
      },
      {
        title: "Sección 5: FAQs de Derribo de Objeciones",
        desc: `Manejo interactivo de las 4 principales objeciones del cliente para eliminar el miedo a la compra: ${compiledOfferBrief.objections.join(' | ')}.`
      },
      {
        title: "Sección 6: Garantía Incondicional y Cierre",
        desc: "Sello de garantía de devolución del 100% del dinero por 30 días. Envío express gratis a todo el país y pago seguro contra entrega."
      }
    ],
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formattedName} | Oficial</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900 antialiased">

  <!-- Floating Header -->
  <header class="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
    <div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
      <span class="font-extrabold text-xl tracking-tight text-indigo-600">${formattedName.toUpperCase()}</span>
      <a href="#order" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-full text-sm shadow-md transition">Ordenar Ahora</a>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 px-4">
    <div class="max-w-5xl mx-auto text-center">
      <span class="inline-block bg-indigo-100 text-indigo-800 text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-6">Lanzamiento Exclusivo</span>
      <h1 class="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight mb-6">${compiledOfferBrief.headlines[0]}</h1>
      <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">Descubre el poder de la estimulación celular activa en casa. ${compiledOfferBrief.bigIdea}</p>
      <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
        <a href="#order" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-indigo-200 transition text-center">Ordenar Con 50% De Descuento</a>
        <a href="#details" class="w-full sm:w-auto text-gray-600 hover:text-indigo-600 font-semibold px-6 py-3 transition text-center">Ver Cómo Funciona &rarr;</a>
      </div>
    </div>
  </section>

  <!-- Problem Section -->
  <section id="details" class="py-16 bg-white px-4 border-b border-gray-100">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Por Qué las Soluciones Tradicionales Fallan</h2>
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div class="space-y-4">
          <p class="text-gray-600 leading-relaxed"><strong class="text-red-500">El verdadero problema:</strong> ${compiledOfferBrief.ump}</p>
          <p class="text-gray-600 leading-relaxed">Las cremas costosas y los masajes superficiales solo tapan los síntomas en la superficie de la piel. No pueden rehidratar ni liberar la presión de las células profundas comprimidas por el estrés y la rutina moderna.</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h4 class="font-bold text-lg mb-4 text-red-600">&times; Lo que siempre has probado:</h4>
          <ul class="space-y-3 text-sm text-gray-600">
            <li class="flex items-center gap-2"><span>⚠️ Cremas llenas de parabenos químicos</span></li>
            <li class="flex items-center gap-2"><span>⚠️ Sesiones en spas a precios abusivos</span></li>
            <li class="flex items-center gap-2"><span>⚠️ Frotamientos e irritación en piel sensible</span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Solution Section -->
  <section class="py-16 bg-gray-50 px-4">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">El Mecanismo Científico de ${formattedName}</h2>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="order-2 md:order-1 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h4 class="font-bold text-xl mb-4 text-green-600">&checkmark; El Mecanismo de la Solución:</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-6">${compiledOfferBrief.ums}</p>
          <div class="space-y-3 text-sm text-gray-600">
            <div class="flex items-center gap-3"><span class="text-green-500">&bull;</span><span>Estimulación microvibratoria a nivel de capas profundas.</span></div>
            <div class="flex items-center gap-3"><span class="text-green-500">&bull;</span><span>Drenaje linfático pasivo y oxigenación inmediata.</span></div>
            <div class="flex items-center gap-3"><span class="text-green-500">&bull;</span><span>Materiales hipoalergénicos de grado médico.</span></div>
          </div>
        </div>
        <div class="order-1 md:order-2 space-y-4">
          <h3 class="text-2xl font-bold text-gray-900">Una Revolución para tu Cuidado Personal</h3>
          <p class="text-gray-600 leading-relaxed">${compiledOfferBrief.product}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="py-16 bg-white px-4 border-b border-gray-100">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Lo Que Opinan los Compradores Reales</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="p-6 bg-gray-50 rounded-xl border border-gray-100">
          <p class="text-sm italic text-gray-600 mb-4">"${compiledVerbatims[0]}"</p>
          <span class="font-bold text-xs text-gray-500">Marta S. &bull; Comprador Verificado</span>
        </div>
        <div class="p-6 bg-gray-50 rounded-xl border border-gray-100">
          <p class="text-sm italic text-gray-600 mb-4">"${compiledVerbatims[1]}"</p>
          <span class="font-bold text-xs text-gray-500">Lucía R. &bull; Comprador Verificado</span>
        </div>
        <div class="p-6 bg-gray-50 rounded-xl border border-gray-100">
          <p class="text-sm italic text-gray-600 mb-4">"${compiledVerbatims[2]}"</p>
          <span class="font-bold text-xs text-gray-500">Javier M. &bull; Comprador Verificado</span>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section (Objections) -->
  <section class="py-16 bg-gray-50 px-4">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Preguntas Frecuentes</h2>
      <div class="space-y-4">
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 class="font-bold text-gray-900 mb-2">¿Es seguro para pieles ultra-sensibles?</h4>
          <p class="text-sm text-gray-600">Sí, absolutamente. Su cabezal está fabricado con una aleación hipoalergénica que calma los poros en lugar de frotar o irritar la dermis.</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 class="font-bold text-gray-900 mb-2">¿Cuánto tiempo toma ver resultados?</h4>
          <p class="text-sm text-gray-600">Verás un drenaje visible de líquidos y una mejora de la firmeza en tu primer tratamiento de 3 minutos. Los beneficios acumulados son visibles en 14 días de uso continuo.</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 class="font-bold text-gray-900 mb-2">¿Cómo funciona la garantía?</h4>
          <p class="text-sm text-gray-600">Ofrecemos una garantía incondicional de devolución del dinero de 30 días. Si no estás completamente satisfecho con tu compra, te reembolsaremos el 100% de tu pago.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Call to Action (Order) -->
  <section id="order" class="py-20 bg-indigo-900 text-white text-center px-4">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-4xl font-extrabold mb-6">Recupera tu Vitalidad Hoy</h2>
      <p class="text-indigo-200 mb-10 max-w-xl mx-auto">Únete a los miles de clientes que han transformado su rutina. Garantía de reembolso del 100% por 30 días. Envío express gratis.</p>
      <div class="bg-white text-gray-900 p-8 rounded-2xl max-w-md mx-auto text-left shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <span class="text-gray-500 font-bold text-sm">OFERTA ESPECIAL</span>
          <span class="bg-red-100 text-red-800 text-xs font-black px-2 py-1 rounded">50% DESCUENTO</span>
        </div>
        <div class="flex justify-between items-baseline mb-6">
          <span class="text-2xl font-extrabold text-indigo-600">$${retail.toFixed(2)}</span>
          <span class="text-sm text-gray-400 line-through">$${(retail * 2).toFixed(2)}</span>
        </div>
        <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition">COMPRAR AHORA (CONTRA-ENTREGA)</button>
        <span class="block text-center text-xs text-gray-400 mt-4">🔒 Pago seguro procesado de forma local. Envíos en 24-48 horas.</span>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-950 text-gray-500 py-12 text-center text-xs">
    <p class="mb-4">&copy; ${new Date().getFullYear()} ${formattedName} Inc. Todos los derechos reservados.</p>
    <p>Este sitio no es parte de Meta ni de Google Inc. El rendimiento real depende de cada usuario.</p>
  </footer>

</body>
</html>`
  };

  // Generar Competitor Analysis
  const compiledCompetitorAnalysis = {
    competitorsGanchos: [
      `Uso de productos comunes y genéricos sin factor de novedad.`,
      `Campañas con falsa promesa exagerada sin mecanismo biológico explicativo.`,
      `Tratamientos manuales tradicionales extremadamente lentos e incómodos.`
    ],
    ourGanchos: [
      `Posicionamiento tecnológico disruptivo con Mecanismo de Solución Científico.`,
      `Ángulo de marketing de "Gimnasio Linfático Portátil" o "Descompresión Pasiva".`,
      `Copy enfocado en historias de terror de competidores para invalidar su eficacia.`
    ],
    weaknesses: `Dependencia de métodos invasivos o químicos que irritan o causan frustración en el usuario por falta de resultados rápidos.`,
    differentiation: `Evitar hablar del precio o de ingredientes. Posicionar el producto como un ritual biológico natural potenciado por tecnología que ahorra miles de dólares al año.`
  };

  // Generate mock suppliers based on cost
  const supplier1Cost = Math.round((cost * 0.85) * 100) / 100; // AliExpress is cheaper
  const supplier2Cost = Math.round((cost * 1.05) * 100) / 100; // CJ Dropshipping slightly higher product cost but better shipping
  const supplier3Cost = Math.round((cost * 0.6) * 100) / 100;  // Alibaba bulk/factory cost

  const suppliers = [
    {
      platform: "AliExpress",
      name: `Shenzhen ${formattedName.split(' ')[0] || 'Global'} Trading Co., Ltd.`,
      price: supplier1Cost,
      shippingCost: Math.round((shipping * 0.4) * 10) / 10,
      shippingTime: `${shipping - 2}-${shipping + 2}`,
      link: `https://es.aliexpress.com/wholesale?SearchText=${encodeURIComponent(formattedName.toLowerCase())}`
    },
    {
      platform: "CJ Dropshipping",
      name: `CJ ${formattedName.split(' ')[0] || 'Fast'} Logistics Special Supplier`,
      price: supplier2Cost,
      shippingCost: Math.round((shipping * 0.6) * 10) / 10,
      shippingTime: `${shipping - 4}-${shipping}`,
      link: `https://cjdropshipping.com/list/product-list?search=${encodeURIComponent(formattedName.toLowerCase())}`
    },
    {
      platform: "Alibaba",
      name: `Yiwu ${formattedName.split(' ')[0] || 'Excellent'} E-Commerce Factory (Volume)`,
      price: supplier3Cost,
      shippingCost: Math.round((shipping * 1.5) * 10) / 10,
      shippingTime: "15-25",
      link: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(formattedName.toLowerCase())}`
    }
  ];

  // Procedural Email Sequence Generator (5 emails)
  const compiledEmailSequence = [
    {
      subject: `Re: Tu problema con ${formattedName}`,
      preview: "Por fin hay una solución que funciona desde el día 1...",
      body: `Hola,\n\nSi has estado luchando con tu rutina diaria y sientes que nada de lo que compras te da los resultados que buscas, sé exactamente cómo te sientes.\n\nLa mayoría de las soluciones tradicionales tardan semanas, cuestan cientos de dólares y a menudo irritan tu cuerpo.\n\nPor eso creamos **${formattedName}**.\n\nUtiliza tecnología avanzada para aliviar tus molestias y restaurar tu bienestar físico en minutos.\n\nMañana te contaré la ciencia oculta detrás de por qué los métodos tradicionales fallan, pero hoy puedes echarle un vistazo aquí:\n\n[Ver ${formattedName} con 50% de Descuento]`
    },
    {
      subject: "La verdad oculta sobre los tratamientos tradicionales",
      preview: "Por qué las grandes marcas no quieren que sepas esto...",
      body: `Hola de nuevo,\n\n¿Sabías que el 90% de los tratamientos tradicionales solo tratan la superficie?\n\nLa industria quiere que sigas comprando botes de $100 y reservando citas mensuales.\n\nPero el verdadero secreto está en la estimulación profunda y en la activación celular natural.\n\n**${formattedName}** activa los procesos de reparación naturales de tu cuerpo usando microvibraciones.\n\nEn el siguiente correo, te mostraré los resultados de personas reales que ya lo han probado.\n\nAtentamente,\nEl Equipo de DropDeep`
    },
    {
      subject: "Resultados reales (Opiniones verificadas)",
      preview: "Mira lo que dicen nuestros clientes...",
      body: `Hola,\n\nNo tienes que creernos a nosotros. Mira lo que dice una de nuestras compradoras:\n\n*"Estaba muy escéptica al principio porque había probado de todo, pero después de usar ${formattedName} durante 10 días, mis molestias desaparecieron y luce increíble."*\n\nAl igual que ella, miles de personas están usando ${formattedName} en casa para obtener resultados profesionales sin gastar una fortuna.\n\n[Lee más de 120 testimonios verificados aquí]`
    },
    {
      subject: "⚠️ Tu oferta exclusiva expira hoy",
      preview: "Consigue un 50% de descuento en tu pedido...",
      body: `Hola,\n\nSi has estado pensando en probar **${formattedName}**, hoy es el momento ideal.\n\nNuestra promoción de lanzamiento con un **50% de descuento y envío gratuito** termina esta noche a las 23:59.\n\nNo arriesgues tu dinero: ofrecemos una garantía de satisfacción de 30 días. Si no ves resultados, te devolvemos el dinero.\n\n[Asegura tu ${formattedName} con Descuento del 50% ahora]`
    },
    {
      subject: "Último recordatorio: Stock casi agotado",
      preview: "Últimas 14 unidades disponibles en almacén...",
      body: `Hola,\n\nSolo queríamos avisarte que nos quedan menos de 15 unidades de **${formattedName}** en stock debido a la alta demanda tras nuestro último video viral.\n\nSi cierras esta pestaña, es probable que no podamos ofrecerte el mismo precio ni envío rápido hasta la reposición el próximo mes.\n\n[Haz clic aquí para reclamar tu unidad ahora]`
    }
  ];

  // Procedural Ad Copy (Meta & TikTok)
  const compiledAdCopy = {
    facebook: [
      {
        primaryText: `¿Cansado de gastar cientos de dólares en tratamientos que no funcionan? 💸 El nuevo ${formattedName} ofrece resultados profesionales en la comodidad de tu hogar en sólo 10 minutos al día. Consigue el tuyo hoy con un 50% de descuento de lanzamiento.`,
        headline: `${formattedName} - Resultados Profesionales en Casa 🌟`,
        description: "Garantía de reembolso de 30 días. Envío rápido gratis."
      },
      {
        primaryText: `⚠️ ADVERTENCIA: La mayoría de las marcas tradicionales ocultan esto. El verdadero secreto para un bienestar duradero no son los químicos, sino la estimulación celular profunda. Descubre cómo ${formattedName} está revolucionando el mercado. 👇`,
        headline: "Dile Adiós a las Molestias con Tecnología Natural 🧬",
        description: "Últimas unidades disponibles con 50% de descuento."
      },
      {
        primaryText: `Más de 15,000 personas ya han sustituido sus costosas citas mensuales por el revolucionario ${formattedName}. Mira por qué se ha vuelto viral en redes sociales y lee sus opiniones.`,
        headline: "⭐ 4.9/5 Estrellas de Clientes Satisfechos",
        description: "Compra hoy y paga al recibir (Disponible en zonas seleccionadas)."
      }
    ],
    tiktok: [
      {
        hook: "Prueba esto hoy si estás harta de gastar dinero en bienestar 🤫",
        body: `Llevo usando el nuevo ${formattedName} por una semana y el cambio es brutal. Mis molestias disminuyeron y me siento espectacular. Lo mejor es que es súper fácil de usar.`,
        cta: "Consíguelo con 50% OFF en el link del perfil 🔗"
      },
      {
        hook: "El producto de dropshipping más viral del año que sí funciona 🤯",
        body: `Todos en mi feed hablane de esto y tuve que pedirlo. Es el ${formattedName}. Estimula la microcirculación profunda y te ahorra miles de dólares al año. Es mi obsesión actual.`,
        cta: "Envío rápido gratis hoy tocando abajo 👇"
      },
      {
        hook: "POV: Tienes el tocador de tus sueños y te sientes increíble 💫",
        body: `Mi rutina nocturna con el ${formattedName}. Es ultra relajante, silencioso y súper estético. Si quieres consentirte, este es el regalo perfecto.`,
        cta: "Descuento por liquidación disponible hoy 🛒"
      }
    ]
  };

  // Procedural Shopify Description Layout
  const compiledShopifyDescription = {
    title: `${formattedName} - Dispositivo Avanzado de Bienestar & Estimulación`,
    metaDescription: `Consigue resultados profesionales en casa con el revolucionario ${formattedName}. Elimina molestias, mejora la firmeza y ahorra miles de dólares. Envío gratis y 50% OFF hoy.`,
    body: `<p>¿Quieres disfrutar de una experiencia de bienestar profesional sin salir de casa y por una fracción del costo? El revolucionario <strong>${formattedName}</strong> es la herramienta definitiva que estabas buscando.</p>
    
    <h3>Beneficios Clave:</h3>
    <ul>
      <li><strong>Estimulación Celular Profunda:</strong> Activa los capilares y acelera la regeneración natural de las células.</li>
      <li><strong>Tecnología Ultrasónica Patentada:</strong> Emite microvibraciones suaves que limpian y tonifican la zona sin causar irritación.</li>
      <li><strong>Ahorro Inteligente:</strong> Sustituye de por vida las costosas suscripciones y visitas a centros.</li>
      <li><strong>Diseño Ergonómico e Inalámbrico:</strong> Llévalo contigo y utilízalo en cualquier lugar gracias a su batería de larga duración.</li>
    </ul>

    <h3>¿Cómo se utiliza?</h3>
    <ol>
      <li>Limpia la zona objetivo y aplica tu aceite o crema favorita para facilitar el deslizamiento.</li>
      <li>Enciende el dispositivo y selecciona el nivel de intensidad deseado.</li>
      <li>Desliza suavemente con movimientos ascendentes durante 5-10 minutos.</li>
    </ol>`,
    faq: [
      { q: "¿En cuánto tiempo veré los resultados?", a: "Muchos clientes notan una reducción de la tensión y mayor comodidad desde la primera sesión. Los cambios acumulativos son claramente visibles tras 10-14 días de uso diario." },
      { q: "¿Es seguro para pieles y zonas sensibles?", a: "Sí, está fabricado con materiales hipoalergénicos aprobados de calidad médica y utiliza vibraciones suaves ajustables, lo que evita por completo cualquier daño o fricción dolorosa." },
      { q: "¿Cuánto dura la batería?", a: "Una sola carga completa dura hasta 3 horas de uso continuo, lo que equivale aproximadamente a un mes de uso regular de 5-10 minutos diarios." }
    ]
  };

  return {
    name: formattedName,
    categoryId,
    cost,
    retail,
    margin: Math.round((retail - cost) * 100) / 100,
    roi: Math.round(((retail - cost) / cost) * 100),
    shipping,
    sales,
    saturation,
    trend,
    demographics: compiledDemographics,
    solutions: compiledSolutions,
    secrets: compiledSecrets,
    eden: compiledEden,
    verbatims: compiledVerbatims,
    angles: compiledAngles,
    avatarBrief: compiledAvatarBrief,
    offerBrief: compiledOfferBrief,
    ugcScripts: compiledUgcScripts,
    landingPage: compiledLandingPage,
    competitorAnalysis: compiledCompetitorAnalysis,
    suppliers,
    emailSequence: compiledEmailSequence,
    adCopy: compiledAdCopy,
    shopifyDescription: compiledShopifyDescription
  };
}
