export interface SubjectPurposes {
  mecanica: string;
  algebra: string;
  tecnologias: string;
  didactica: string;
}

export interface ProjectRubric {
  criterio: string;
  nivelEsperado: string;
}

export interface GuideSection {
  id: string;
  number: string;
  title: string;
  subtitles: string[];
  content: string; // Left blank '' initially as requested ("deja en blanco la información solamente integra los títulos de cada cosa")
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: 'applet' | 'link' | 'pdf' | 'simulador' | 'video';
  description?: string;
}

export type SimulatorType =
  | 'roller-coaster'
  | 'flying-chairs'
  | 'swinging-ship'
  | 'equatorial-sundial'
  | 'bumper-cars'
  | 'none';

export interface SimulatorConfig {
  type: SimulatorType;
  appletUrl?: string;
  title: string;
  description: string;
}

export interface ModuleItem {
  id: string;
  semesterNumber: number;
  order: number;
  teamName: string; // e.g., "Equipo 1"
  title: string; // e.g., "Equipo 1: La Montaña Rusa"
  shortName: string;
  category: string;
  subjectPurposes: SubjectPurposes;
  rubric: ProjectRubric;
  guideSections: GuideSection[]; // Structured blank sections with official guide titles
  theoryContent: string; // Left blank '' initially as requested
  historyContent: string; // Left blank '' initially as requested
  simulatorConfig?: SimulatorConfig;
  resources: ResourceLink[];
  notes: string[];
  lastUpdated: string;
}

export interface EmergentTechTeamVideo {
  id: string;
  teamNumber: number;
  teamName: string;
  projectTitle: string;
  videoTitle: string;
  videoUrl: string; // Blank '' initially
}

export interface Semester {
  number: number;
  name: string;
  projectIntegratorTitle?: string;
  projectIntegratorPurpose?: string;
  articulatedSubjects?: string[];
  academicYear: string;
  description: string;
  status: 'active' | 'upcoming' | 'completed';
  modules: ModuleItem[];
  emergentTechVideos?: EmergentTechTeamVideo[];
}
