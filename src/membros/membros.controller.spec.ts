import { Test, TestingModule } from '@nestjs/testing';
import { MembrosController } from './membros.controller';
import { MembrosService } from './membros.service';

describe('MembrosController', () => {
  let controller: MembrosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembrosController],
      providers: [MembrosService],
    }).compile();

    controller = module.get<MembrosController>(MembrosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
