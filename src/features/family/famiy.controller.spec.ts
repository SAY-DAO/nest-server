import 'dotenv/config';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { FamilyController } from './family.controller';
import { NeedService } from '../need/need.service';
import { PaymentService } from '../payment/payment.service';
import { TypeOrmSQLITETestingModule } from './TypeORMSQLITETestingModule';
import {
  isAuthenticated,
  updateFlaskCacheAuthentication,
} from '../../utils/auth';
import { ServerError } from '../../filters/server-exception.filter';
import { ForbiddenException, Logger } from '@nestjs/common';
import { ObjectNotFound } from '../../filters/notFound-expectation.filter';
import { NeedEntity } from '../../entities/need.entity';
import {
  CONTRIBUTION_COEFFICIENT,
  getContributionRatio,
} from '../../utils/helpers';
import { round } from 'mathjs';
import { CategoryEnum, NeedTypeEnum } from '../../types/interfaces/interface';

// Mock classes for dependencies
class MockNeedService {
  async getNeedById(needId: string) {
    // Mock implementation
  }
  async getConfirmsInRange(
    confirmDate: Date,
    category: string,
    type: string,
    months: number,
  ) {
    // Mock implementation
  }
}

class MockPaymentService {
  async getPaymentsInRange(
    paymentDate: Date,
    category: string,
    type: string,
    months: number,
  ) {
    // Mock implementation
  }
}

describe('FamilyController', () => {
  let mockRequest: Request;
  let familyController: FamilyController;
  let needService: NeedService;
  let paymentService: PaymentService;
  let needFlaskId: number;
  let needNestId: string;
  let nestNeed: NeedEntity;
  let needServiceMock: { getConfirmsInRange: jest.Mock };

  beforeAll(async () => {
    needServiceMock = { getConfirmsInRange: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmSQLITETestingModule()],
      providers: [
        {
          provide: NeedService,
          useValue: needServiceMock,
        },
      ],
    }).compile();

    const logger = new Logger(describe.name);

    // Mock request
    mockRequest = createMock<Request>({ headers: {} });
    mockRequest.headers['accept'] = 'application/json';
    mockRequest.headers['authorization'] = process.env.ACCESS_TOKEN;
    mockRequest.headers['flaskid'] = process.env.ADMIN_FLASK_ID;

    familyController = module.get<FamilyController>(FamilyController);
    needService = module.get<NeedService>(NeedService);
    paymentService = module.get<PaymentService>(PaymentService);

    // Authenticate user
    try {
      await updateFlaskCacheAuthentication(mockRequest, logger);
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }
    const count = await needService.countNeeds();
    if (count === 0) {
      throw new Error('No Needs found in the database');
    }
    nestNeed = await needService.randomNestNeed(count);
    needFlaskId = nestNeed.flaskId;
    needNestId = nestNeed.id;
  });

  it('should throw ObjectNotFound if need does not belong to user', async () => {
    try {
      await familyController.getNeedCoefficients(needNestId, mockRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(ObjectNotFound);
      expect(e.message).toBe('This is not your need!');
    }
  });
  it('should handle contribution ratio', async () => {
    let verifiedPayments = [
      { flaskUserId: 122, needAmount: 340, verified: true },
      { flaskUserId: 1362, needAmount: 340, verified: true },
      { flaskUserId: 1862, needAmount: 340, verified: true },
      { flaskUserId: 1332, needAmount: 340, verified: true },
    ];
    let result = getContributionRatio(verifiedPayments);
    expect(result).toBe(
      round((verifiedPayments.length - 1) * CONTRIBUTION_COEFFICIENT, 2),
    );
    verifiedPayments = [{ flaskUserId: 333333, needAmount: 0, verified: true }];
    result = getContributionRatio(verifiedPayments);
    expect(result).toBe(1);
  });


});
