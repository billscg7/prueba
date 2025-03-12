import axios, { AxiosRequestConfig } from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const loginService = {
    login: async (username: string, password: string) => {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        const response = await api.post('/auth/access-token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
};

// Projects
export const projectService = {
    getProjects: async () => {
        const response = await api.get('/projects');
        return response.data;
    },
    getProject: async (id: number) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },
    createProject: async (projectData: any) => {
        const response = await api.post('/projects', projectData);
        return response.data;
    },
};

// Layers
export const layerService = {
    getLayers: async (projectId: number) => {
        const response = await api.get(`/layers?project_id=${projectId}`);
        return response.data;
    },
    createLayer: async (layerData: any) => {
        const response = await api.post('/layers', layerData);
        return response.data;
    },
};

// Elements
export const elementService = {
    getElements: async (projectId: number) => {
        const response = await api.get(`/elements?project_id=${projectId}`);
        return response.data;
    },
    createElement: async (elementData: any) => {
        const response = await api.post('/elements', elementData);
        return response.data;
    },
    updateElement: async (id: number, elementData: any) => {
        const response = await api.put(`/elements/${id}`, elementData);
        return response.data;
    },
    deleteElement: async (id: number) => {
        const response = await api.delete(`/elements/${id}`);
        return response.data;
    },
};

// NLP Commands
export const nlpService = {
    processCommand: async (command: string, projectId: number) => {
        const response = await api.post('/nlp/process', {
            command,
            project_id: projectId,
        });
        return response.data;
    },
};

export default api;