// Servicio para manejar datos de organización y empleados
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

export const organizacionService = {
  // Obtener datos de la organización del usuario actual
  async obtenerOrganizacionUsuario() {
    try {
      const sub = sessionStorage.getItem('sub');
      if (!sub) {
        throw new Error('No hay usuario autenticado');
      }

      const response = await axios.get(`${API_BASE_URL}/api/usuarios/perfil`, {
        headers: {
          'X-Usuario-Sub': sub
        }
      });
      
      if (response.data && response.data.empresaId) {
        // Obtener datos completos de la empresa
        const empresaResponse = await axios.get(`${API_BASE_URL}/api/empresas/${response.data.empresaId}`, {
          headers: {
            'X-Usuario-Sub': sub
          }
        });
        
        return {
          id: response.data.empresaId,
          nombre: empresaResponse.data.nombre || response.data.empresaNombre,
          descripcion: empresaResponse.data.descripcion,
          cuit: empresaResponse.data.cuit,
          condicionIVA: empresaResponse.data.condicionIVA,
          domicilio: empresaResponse.data.domicilio
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos de la organización:', error);
      return null;
    }
  },

  // Obtener empleados de la organización del usuario actual
  async obtenerEmpleadosOrganizacion() {
    try {
      const sub = sessionStorage.getItem('sub');
      if (!sub) {
        throw new Error('No hay usuario autenticado');
      }

      // Primero obtener el ID de la organización del usuario
      const perfilResponse = await axios.get(`${API_BASE_URL}/api/usuarios/perfil`, {
        headers: {
          'X-Usuario-Sub': sub
        }
      });
      
      if (perfilResponse.data && perfilResponse.data.empresaId) {
        // Obtener empleados de la organización
        const empleadosResponse = await axios.get(`${API_BASE_URL}/api/usuarios/empresa/${perfilResponse.data.empresaId}`, {
          headers: {
            'X-Usuario-Sub': sub
          }
        });
        
        return empleadosResponse.data;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener empleados de la organización:', error);
      return [];
    }
  },

  // Actualizar datos de la organización (solo admin)
  async actualizarOrganizacion(datosOrganizacion) {
    try {
      const sub = sessionStorage.getItem('sub');
      if (!sub) {
        throw new Error('No hay usuario autenticado');
      }

      // Obtener el ID de la organización
      const perfilResponse = await axios.get(`${API_BASE_URL}/api/usuarios/perfil`, {
        headers: {
          'X-Usuario-Sub': sub
        }
      });
      
      if (perfilResponse.data && perfilResponse.data.empresaId) {
        const response = await axios.put(`${API_BASE_URL}/api/empresas/${perfilResponse.data.empresaId}`, datosOrganizacion, {
          headers: {
            'X-Usuario-Sub': sub
          }
        });
        
        return response.data;
      }
      throw new Error('No se encontró la organización del usuario');
    } catch (error) {
      console.error('Error al actualizar organización:', error);
      throw error;
    }
  },

  // Actualizar empleado (solo admin)
  async actualizarEmpleado(empleadoSub, datosEmpleado) {
    try {
      const sub = sessionStorage.getItem('sub');
      if (!sub) {
        throw new Error('No hay usuario autenticado');
      }

      const response = await axios.put(`${API_BASE_URL}/api/usuarios/${empleadoSub}`, datosEmpleado, {
        headers: {
          'X-Usuario-Sub': sub
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      throw error;
    }
  },

  // Eliminar empleado (solo admin)
  async eliminarEmpleado(empleadoSub) {
    try {
      const sub = sessionStorage.getItem('sub');
      if (!sub) {
        throw new Error('No hay usuario autenticado');
      }

      const response = await axios.delete(`${API_BASE_URL}/api/usuarios/${empleadoSub}`, {
        headers: {
          'X-Usuario-Sub': sub
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      throw error;
    }
  }
};
