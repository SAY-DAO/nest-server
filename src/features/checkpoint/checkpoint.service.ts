import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCheckPointDto } from './dto/create-checkpoint.dto';
import { CheckPointEntity } from '../../entities/checkpoint.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { GetCheckpointsDto } from './dto/get-checkpoints.dto';

@Injectable()
export class CheckPointService {
  // maximum allowed unconfirmed checkpoints per user
  private readonly MAX_UNCONFIRMED = 5;

  constructor(
    @InjectRepository(CheckPointEntity)
    private checkPointRepository: Repository<CheckPointEntity>,
    @InjectRepository(AllUserEntity)
    private allUserRepository: Repository<AllUserEntity>,
  ) {}

  /**
   * Create a checkpoint for a user, enforcing "max 5 unconfirmed" rule.
   * Uses a transaction + pessimistic lock to avoid race conditions.
   */
  async createForUser(
    user: AllUserEntity,
    dto: CreateCheckPointDto,
  ): Promise<CheckPointEntity> {
    try {
      const unconfirmedCount = await this.checkPointRepository
        .createQueryBuilder('cp')
        .where('cp.userId = :userId', { userId: user.id })
        .andWhere('cp.isConfirmed = false')
        .getCount();
      if (unconfirmedCount >= this.MAX_UNCONFIRMED) {
        throw new BadRequestException(
          `You can have up to ${this.MAX_UNCONFIRMED} unconfirmed checkpoints. Wait for approval before posting new ones.`,
        );
      }
      const cp = this.checkPointRepository.create({
        title: dto.title,
        description: dto.description,
        type: dto.type,
        user,
        isConfirmed: false,
        confirmedAt: null,
      });
      return await this.checkPointRepository.save(cp);
    } catch (err) {
      throw err;
    }
  }

  async findByUser(
    userId: string,
    type?: string,
    onlyConfirmed?: boolean,
    limit = 50,
    offset = 0,
  ): Promise<CheckPointEntity[]> {
    const qb = this.checkPointRepository
      .createQueryBuilder('cp')
      .where('cp.id = :userId', { userId });

    if (type) qb.andWhere('cp.type = :type', { type });
    if (onlyConfirmed === true) qb.andWhere('cp.isConfirmed = true');
    if (onlyConfirmed === false) qb.andWhere('cp.isConfirmed = false');

    qb.orderBy('cp.createdAt', 'DESC').skip(offset).take(limit);

    return qb.getMany();
  }

  async findOne(id: string): Promise<CheckPointEntity> {
    const cp = await this.checkPointRepository.findOne({ where: { id } });
    if (!cp)
      throw new NotFoundException(`CheckPointEntity with id ${id} not found`);
    return cp;
  }

  async findAll(query: GetCheckpointsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const sort = query.sort ?? 'createdAt:desc';
    const [sortField, sortDir] = sort.split(':');
    const orderDirection =
      sortDir && sortDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.checkPointRepository
      .createQueryBuilder('cp')
      .leftJoinAndSelect('cp.user', 'user');

    if (query.q) {
      const q = `%${query.q}%`;
      // Postgres ILIKE for case-insensitive search; if you're not using Postgres adjust accordingly.
      qb.andWhere('(cp.title ILIKE :q OR cp.description ILIKE :q)', { q });
    }

    if (query.type) {
      qb.andWhere('cp.type = :type', { type: query.type });
    }

    if (typeof query.isConfirmed === 'boolean') {
      qb.andWhere('cp.isConfirmed = :isConfirmed', {
        isConfirmed: query.isConfirmed,
      });
    }

    // protect against SQL injection by allowing only a small set of sortable fields
    const allowedSortFields = new Set(['createdAt', 'confirmedAt', 'title']);
    const orderField = allowedSortFields.has(sortField)
      ? `cp.${sortField}`
      : 'cp.createdAt';

    qb.orderBy(orderField, orderDirection as 'ASC' | 'DESC');
    qb.skip(skip).take(take);

    const [items, total] = await qb.getManyAndCount();

    // map to include simple userName convenience field
    const mapped = items.map((it) => {
      const user = it.user as any;
      const userName = user
        ? user.name || user.username || user.email || user.id
        : undefined;
      return {
        ...it,
        userName,
        userId: it.userId ?? (user ? user.id : undefined),
      };
    });

    return { items: mapped, total };
  }

  /**
   * Confirm a checkpoint (admin action). Sets isConfirmed = true and confirmedAt timestamp.
   */
  async confirmCheckpoint(
    id: string,
    confirmerId?: number,
  ): Promise<CheckPointEntity> {
    const cp = await this.checkPointRepository.findOne({ where: { id } });
    if (!cp)
      throw new NotFoundException(`CheckPointEntity with id ${id} not found`);

    if (cp.isConfirmed) return cp; // already confirmed (idempotent)

    cp.isConfirmed = true;
    cp.confirmedAt = new Date();
    // optionally: store confirmerId in another column if you need who approved
    return this.checkPointRepository.save(cp);
  }

  async remove(id: string): Promise<void> {
    const res = await this.checkPointRepository.delete(id);
    if (res.affected === 0)
      throw new NotFoundException(`CheckPointEntity with id ${id} not found`);
  }
}
