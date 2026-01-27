import { TestBed } from '@angular/core/testing';

import { PortalcliLogicaService } from './portalcli-logica.service';

describe('PortalcliLogicaService', () => {
  let service: PortalcliLogicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortalcliLogicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
