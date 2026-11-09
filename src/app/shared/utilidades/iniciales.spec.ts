import { iniciales } from './iniciales';

describe('iniciales', () => {
  it('toma la primera letra de nombre y apellido', () => {
    expect(iniciales('Ana Pérez')).toBe('AP');
  });

  it('con un solo nombre usa una letra', () => {
    expect(iniciales('laura')).toBe('L');
  });

  it('ignora los espacios de más y los segundos nombres', () => {
    expect(iniciales('  Juan  Carlos Torres ')).toBe('JC');
  });
});
