import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/create-task.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAllTasks(): Promise<Task[]> {
    const cacheKey = 'all_tasks';
    // Check if the tasks are cached
    const cachedTasks = await this.cacheManager.get<Task[]>(cacheKey);
    if (cachedTasks) {
      return cachedTasks; // Return cached tasks if available
    }

    // If not cached, fetch from the database and cache the result
    const tasks = await this.taskRepository.find();
    await this.cacheManager.set(cacheKey, tasks, 300); // Cache for 5 minutes
    return tasks;
  }

  async getTaskById(id: string): Promise<Task> {
    const cacheKey = `task_${id}`;
    // Check if the task is cached
    const cachedTask = await this.cacheManager.get<Task>(cacheKey);
    if (cachedTask) {
      return cachedTask; // Return cached task if available
    }

    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, task, 300); // Cache for 5 minutes
    return task;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    await this.taskRepository.save(task);
    
    // Invalidate cache for all tasks since a new task is created
    await this.cacheManager.del('all_tasks');

    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Invalidate cache for the specific task
    await this.cacheManager.del(`task_${id}`);
    // Invalidate cache for all tasks
    await this.cacheManager.del('all_tasks');
  }

  async updateTaskStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto): Promise<Task> {
    const task = await this.getTaskById(id);
    task.status = updateTaskStatusDto.status;
    await this.taskRepository.save(task);
    
    // Invalidate cache for the specific task
    await this.cacheManager.del(`task_${id}`);
    
    return task;
  }
}
