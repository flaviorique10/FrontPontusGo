// src/services/userService.ts
import api from './api';
import type { Student, StudentProfile, CreateStudentDto, AwardDailyPointsDto, DailyPointsSummary, TuitionStatus } from '../types';

export const userService = {
  // Admin: lista todos os estudantes
  getAllStudents: async (): Promise<Student[]> => {
    const response = await api.get<Student[]>('/api/users/students');
    return response.data;
  },

  // Perfil do estudante por ID
  getStudentProfile: async (id: string): Promise<StudentProfile> => {
    const response = await api.get<StudentProfile>(`/api/users/students/${id}`);
    return response.data;
  },

  // Admin: cadastrar novo estudante
  createStudent: async (data: CreateStudentDto): Promise<StudentProfile> => {
    const response = await api.post<StudentProfile>('/api/users/students', data);
    return response.data;
  },

  // Admin: atualizar status da mensalidade do estudante
  updateTuitionStatus: async (studentId: string, status: TuitionStatus | number): Promise<Student> => {
    const numericStatus = typeof status === 'number' 
      ? status 
      : status === 'Pending' ? 2 : status === 'Overdue' ? 3 : 1;

    const response = await api.patch<Student>(`/api/users/${studentId}/tuition-status`, {
      status: numericStatus
    });
    return response.data;
  },

  // Admin / Estudante: obter resumo de pontuação diária
  getDailyPointsSummary: async (studentId: string): Promise<DailyPointsSummary> => {
    const response = await api.get<DailyPointsSummary>(`/api/users/${studentId}/daily-points-summary`);
    return response.data;
  },

  // Admin: bonificar estudante com atividades do dia (Assiduidade, Participação, Tarefa)
  awardDailyPoints: async (studentId: string, data: AwardDailyPointsDto): Promise<Student> => {
    const response = await api.post<Student>(`/api/users/${studentId}/award-daily-points`, data);
    return response.data;
  },

  // Admin: adicionar pontos avulsos a um estudante
  addPoints: async (studentId: string, points: number, description: string): Promise<StudentProfile> => {
    const response = await api.post<StudentProfile>(
      `/api/users/${studentId}/add-points?points=${points}&description=${encodeURIComponent(description)}`
    );
    return response.data;
  },
};