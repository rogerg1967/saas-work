import api from './api';

// Description: Get team members
// Endpoint: GET /api/team
// Request: {}
// Response: { members: Array<{ _id: string, name: string, role: string, email: string, phone: string, image: string }> }
export const getTeamMembers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        members: [
          {
            _id: '1',
            name: 'John Doe',
            role: 'Admin',
            email: 'john@example.com',
            phone: '+44 123 456 7890',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
          },
          {
            _id: '2',
            name: 'Jane Smith',
            role: 'Manager',
            email: 'jane@example.com',
            phone: '+44 123 456 7891',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
          },
          {
            _id: '3',
            name: 'Bob Johnson',
            role: 'Developer',
            email: 'bob@example.com',
            phone: '+44 123 456 7892',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
          }
        ]
      });
    }, 500);
  });
};

// Description: Create team member
// Endpoint: POST /api/team
// Request: { name: string, role: string, email: string, phone: string }
// Response: { success: boolean, member: { _id: string, name: string, role: string, email: string, phone: string, image: string } }
export const createTeamMember = (data: { name: string; role: string; email: string; phone: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        member: {
          _id: Math.random().toString(36).substr(2, 9),
          ...data,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
        }
      });
    }, 500);
  });
};

// Description: Update team member
// Endpoint: PUT /api/team/:id
// Request: { name: string, role: string, email: string, phone: string }
// Response: { success: boolean, member: { _id: string, name: string, role: string, email: string, phone: string, image: string } }
export const updateTeamMember = (id: string, data: { name: string; role: string; email: string; phone: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        member: {
          _id: id,
          ...data,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
        }
      });
    }, 500);
  });
};

// Description: Delete team member
// Endpoint: DELETE /api/team/:id
// Request: {}
// Response: { success: boolean }
export const deleteTeamMember = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true
      });
    }, 500);
  });
};