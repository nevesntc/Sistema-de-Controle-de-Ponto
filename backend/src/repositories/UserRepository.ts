import { User, CreateUserDTO, UserResponse } from '@/types/User';
import database from '@/database/connection';

export interface IUserRepository {
  create(userData: CreateUserDTO): Promise<UserResponse>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<UserResponse | null>;
  update(id: string, userData: Partial<CreateUserDTO>): Promise<UserResponse | null>;
  delete(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async create(userData: CreateUserDTO): Promise<UserResponse> {
    const query = `
      INSERT INTO usuarios (email, nome, senha, cargo)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, nome, cargo, created_at
    `;
    
    const result = await database.query(query, [
      userData.email,
      userData.nome,
      userData.senha,
      userData.cargo,
    ]);

    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await database.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      senha: user.senha,
      cargo: user.cargo,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findById(id: string): Promise<UserResponse | null> {
    const query = 'SELECT id, email, nome, cargo, created_at FROM usuarios WHERE id = $1';
    const result = await database.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      cargo: user.cargo,
      createdAt: user.created_at,
    };
  }

  async update(id: string, userData: Partial<CreateUserDTO>): Promise<UserResponse | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (userData.nome) {
      fields.push(`nome = $${paramCount++}`);
      values.push(userData.nome);
    }

    if (userData.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }

    if (userData.cargo) {
      fields.push(`cargo = $${paramCount++}`);
      values.push(userData.cargo);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE usuarios 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, email, nome, cargo, created_at
    `;

    const result = await database.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM usuarios WHERE id = $1';
    const result = await database.query(query, [id]);
    return result.rowCount > 0;
  }
}
