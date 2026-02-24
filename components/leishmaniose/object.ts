const itens = [
    {
      titulo: 'Descrição',
      icon: 'information-circle-outline' as const,
      descricao: `A Leishmaniose Visceral (LV), também conhecida como Calazar, é uma doença infecciosa sistêmica, de evolução crônica e potencialmente fatal. É causada por protozoários do gênero Leishmania, que acometem órgãos internos como fígado, baço e medula óssea. Quando não tratada, pode levar ao óbito em até 90% dos casos.

Classificada pela Organização Mundial da Saúde (OMS) como uma das doenças tropicais negligenciadas prioritárias, a LV está entre as seis endemias mais importantes do mundo. Nas Américas, o Brasil concentra aproximadamente 90% dos casos registrados.

Historicamente identificada como endemia rural, a LV sofreu expansão progressiva para áreas urbanas e periurbanas a partir da década de 1980, associada a fatores como migração, urbanização desordenada e adaptação do vetor ao ambiente doméstico.

A doença é de notificação compulsória semanal no Brasil (CID-10: B55.0).`,
    },
    {
      titulo: 'Agente Etiológico',
      icon: 'bug-outline' as const,
      descricao: `O agente etiológico da Leishmaniose Visceral nas Américas é um protozoário intracelular obrigatório, que parasita células do sistema fagocítico mononuclear (macrófagos).

Classificação taxonômica:
- Ordem: Kinetoplastida
- Família: Trypanosomatidae
- Gênero: Leishmania
- Complexo: L. donovani
- Espécie no Brasil: L. (L.) infantum

Estudos bioquímicos e moleculares demonstraram que L. chagasi e L. infantum são a mesma espécie, sendo L. infantum o nome atualmente aceito pela comunidade científica.

O parasito apresenta duas formas no ciclo evolutivo:

Amastigota: forma arredondada, sem flagelo, encontrada no interior dos macrófagos do hospedeiro vertebrado. Mede de 2 a 5 micrômetros.

Promastigota: forma alongada e flagelada, encontrada no tubo digestivo do inseto vetor. Diferencia-se em promastigotas metacíclicas (formas infectantes) no intestino anterior do flebotomíneo.`,
    },
    {
      titulo: 'Vetor',
      icon: 'cellular-outline' as const,
      descricao: `O principal vetor da LV no Brasil é o flebotomíneo Lutzomyia longipalpis, da ordem Diptera, família Psychodidae. Popularmente conhecido como mosquito-palha, tatuquira, birigui ou asa-branca, conforme a região.

Características:
- Insetos pequenos (2 a 3 mm), menores que um pernilongo comum
- Coloração amarelada (cor de palha)
- Corpo com pilosidade abundante
- Voo curto e saltitante

Biologia:
- Ciclo terrestre com quatro fases: ovo, larva (4 estádios), pupa e adulto
- Desenvolvimento em locais úmidos, sombreados e ricos em matéria orgânica
- Ciclo completo dura de 30 a 45 dias

Hábitos:
- Atividade crepuscular e noturna
- Somente as fêmeas são hematófagas
- Adaptou-se ao ambiente peridomiciliar e domiciliar (galinheiros, canis, interior de residências)
- Maior abundância durante ou após as chuvas`,
    },
    {
      titulo: 'Reservatório',
      icon: 'paw-outline' as const,
      descricao: `Os reservatórios são hospedeiros vertebrados que mantêm o parasito na natureza, permitindo a continuidade do ciclo de transmissão.

Reservatórios silvestres:
- Raposas: Dusicyon vetulus (raposa-do-campo) e Cerdocyon thous (cachorro-do-mato), primeiros reservatórios silvestres identificados no Brasil
- Marsupiais: Didelphis albiventris (gambá), com hábitos sinantrópicos que conectam os ciclos silvestre e doméstico

Reservatório doméstico:
O cão doméstico (Canis familiaris) é o principal reservatório em áreas urbanas e periurbanas. A infecção canina precede historicamente a ocorrência de casos humanos. Os cães infectados apresentam intenso parasitismo cutâneo, favorecendo a infecção dos flebotomíneos. Muitos cães podem ser assintomáticos, servindo como fonte silenciosa de infecção.

Sinais clínicos nos cães: emagrecimento, queda de pelos (especialmente ao redor dos olhos), crescimento exagerado das unhas, úlceras cutâneas e apatia.

O controle do reservatório canino é uma das estratégias do Programa de Vigilância e Controle da LV do Ministério da Saúde, incluindo inquéritos sorológicos e uso de coleiras impregnadas com deltametrina.`,
    },
    {
      titulo: 'Modo de infecção',
      icon: 'fitness-outline' as const,
      descricao: `A transmissão ocorre pela picada de fêmeas de flebotomíneos infectados durante o repasto sanguíneo. Não há transmissão direta de pessoa a pessoa.

Ciclo de transmissão:

1. A fêmea do flebotomíneo realiza repasto sanguíneo em hospedeiro infectado (geralmente o cão), ingerindo macrófagos com formas amastigotas.

2. No tubo digestivo do inseto, as amastigotas se transformam em promastigotas flageladas, que se multiplicam e migram para o intestino anterior.

3. Ao picar novo hospedeiro, a fêmea inocula promastigotas metacíclicas (formas infectantes) junto com a saliva.

4. As promastigotas são fagocitadas pelos macrófagos do hospedeiro, onde se transformam em amastigotas intracelulares.

5. As amastigotas se multiplicam até romper os macrófagos, disseminando-se para baço, fígado, medula óssea e linfonodos.

Período de incubação: 10 dias a 24 meses no homem (média de 2 a 6 meses); 3 meses a anos no cão (média de 3 a 7 meses).

Crianças, idosos e imunossuprimidos (HIV/AIDS) são mais vulneráveis à infecção.`,
    },
    {
      titulo: 'Sintomatologia',
      icon: 'medkit-outline' as const,
      descricao: `A LV apresenta amplo espectro clínico, desde formas assintomáticas até formas graves. A maioria dos infectados permanece assintomática. A evolução clínica divide-se em três períodos:

Período Inicial (Fase Aguda):
- Febre diária ou intermitente
- Palidez cutâneo-mucosa discreta
- Hepatoesplenomegalia de aumento discreto a moderado
- Pode haver tosse seca e diarreia
- Estado geral preservado
- Facilmente confundida com outras doenças febris

Período de Estado:
- Evolução arrastada (mais de 2 meses)
- Febre irregular e persistente
- Emagrecimento progressivo
- Anemia importante
- Esplenomegalia acentuada (baço pode ultrapassar a cicatriz umbilical)
- Edema de membros inferiores

Período Final (se não tratada):
- Comprometimento intenso do estado geral
- Desnutrição grave
- Edema generalizado
- Hemorragias (epistaxe, petéquias, equimoses)
- Icterícia
- Infecções bacterianas secundárias (principal causa de óbito)
- Letalidade superior a 90% sem tratamento

Sinais de gravidade: icterícia, fenômenos hemorrágicos, edema generalizado, instabilidade hemodinâmica, coinfecção HIV/Leishmania, idade < 6 meses ou > 65 anos.`,
    },
    {
      titulo: 'Aspectos Epidemiológicos',
      icon: 'stats-chart-outline' as const,
      descricao: `No Brasil:
- Responsável por aproximadamente 90% dos casos de LV nas Américas
- Média de 3.000 a 3.500 casos notificados por ano
- Letalidade de 7% a 10%
- Presente em todas as regiões, com maior concentração no Nordeste e Norte
- Urbanização progressiva desde a década de 1980, com epidemias em grandes cidades
- Maior incidência em crianças menores de 5 anos e adultos jovens do sexo masculino
- Padrão cíclico com picos epidêmicos a cada 10 anos

No Piauí:
- Um dos estados mais afetados do Brasil
- Taxa de incidência média de 6,03/100.000 hab. (2007-2019), três vezes superior à média nacional
- Teresina concentra a maioria dos casos, com epidemia urbana desde 1981
- Série histórica confirma padrão cíclico: picos em 1983-84, 1993-94, 2003-04 e 2013
- Tendência de aumento na faixa de 40 a 59 anos
- Leishmanioses ocupam a 1ª posição na carga de doenças tropicais negligenciadas do estado

A coinfecção LV/HIV tem apresentado aumento progressivo, representando desafio adicional para o manejo clínico e o sistema de vigilância.`,
    }
  ];

export default itens
