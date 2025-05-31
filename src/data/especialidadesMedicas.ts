export interface EspecialidadeDetalhe {
  nome: string;
  resumo: string;
}

export const especialidadesMedicas: EspecialidadeDetalhe[] = [
  {
    nome: "Cardiologia",
    resumo: "Diagnóstico e tratamento de doenças do coração e do sistema circulatório."
  },
  {
    nome: "Dermatologia",
    resumo: "Cuidados com a pele, cabelos e unhas, tratando doenças e realizando procedimentos estéticos."
  },
  {
    nome: "Endocrinologia",
    resumo: "Tratamento de distúrbios hormonais e metabólicos, como diabetes e problemas de tireoide."
  },
  {
    nome: "Gastroenterologia",
    resumo: "Diagnóstico e tratamento de doenças do sistema digestório."
  },
  {
    nome: "Geriatria",
    resumo: "Cuidados com a saúde de idosos, prevenindo e tratando doenças comuns nessa faixa etária."
  },
  {
    nome: "Ginecologia e Obstetrícia",
    resumo: "Saúde da mulher, incluindo sistema reprodutor, gravidez e parto."
  },
  {
    nome: "Hematologia",
    resumo: "Estudo e tratamento de doenças do sangue e órgãos hematopoiéticos."
  },
  {
    nome: "Infectologia",
    resumo: "Diagnóstico, tratamento e prevenção de doenças infecciosas e parasitárias."
  },
  {
    nome: "Nefrologia",
    resumo: "Tratamento de doenças dos rins, como insuficiência renal e hipertensão arterial."
  },
  {
    nome: "Neurologia",
    resumo: "Diagnóstico e tratamento de doenças do sistema nervoso central e periférico."
  },
  {
    nome: "Oftalmologia",
    resumo: "Cuidados com a saúde dos olhos e da visão, tratando doenças e realizando cirurgias."
  },
  {
    nome: "Oncologia",
    resumo: "Diagnóstico e tratamento de câncer, utilizando quimioterapia, radioterapia e outras terapias."
  },
  {
    nome: "Ortopedia e Traumatologia",
    resumo: "Tratamento de lesões e doenças do sistema locomotor (ossos, músculos, articulações)."
  },
  {
    nome: "Otorrinolaringologia",
    resumo: "Diagnóstico e tratamento de doenças do ouvido, nariz e garganta."
  },
  {
    nome: "Pediatria",
    resumo: "Cuidados com a saúde de crianças e adolescentes, desde o nascimento até a fase adulta inicial."
  },
  {
    nome: "Pneumologia",
    resumo: "Diagnóstico e tratamento de doenças do sistema respiratório, como asma e pneumonia."
  },
  {
    nome: "Psiquiatria",
    resumo: "Diagnóstico, tratamento e prevenção de transtornos mentais, emocionais e comportamentais."
  },
  {
    nome: "Reumatologia",
    resumo: "Tratamento de doenças reumáticas que afetam articulações, ossos, músculos e tecido conjuntivo."
  },
  {
    nome: "Urologia",
    resumo: "Diagnóstico e tratamento de doenças do sistema urinário de homens e mulheres, e do sistema reprodutor masculino."
  },
  {
    nome: "Clínica Médica",
    resumo: "Atendimento primário e geral de pacientes adultos, focando no diagnóstico e tratamento de diversas doenças."
  }
];

export const nomesEspecialidades = especialidadesMedicas.map(e => ({ value: e.nome, label: e.nome }));