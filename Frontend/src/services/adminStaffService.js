import api from './api';

const getStaff = () => api.get('/admin/staff').then(res => res.data);
const createStaff = (staff) => api.post('/admin/staff', staff).then(res => res.data);
const deleteStaff = (id) => api.delete(`/admin/staff/${id}`);

export default { getStaff, createStaff, deleteStaff };
