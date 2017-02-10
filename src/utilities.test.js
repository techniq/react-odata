import { buildQueryString } from './utilities';

it('should return an empty string by default', () => {
  expect(buildQueryString()).toEqual('');
});

describe('filter', () => {
  it('should handle basic filter without operator', () => {
    const filter = { SomeProp: 1 };
    const expected = '$filter=SomeProp eq 1';
    const actual = buildQueryString({ filter });
    expect(actual).toEqual(expected);
  });

  it('should handle filter with operator', () => {
    const filter = { SomeProp: {'lt': 5 } };
    const expected = '$filter=SomeProp lt 5'
    const actual = buildQueryString({ filter });
    expect(actual).toEqual(expected);
  });

  it('should allow passing filter as string and use verbatim', () => {
    const filter = 'SomeProp eq 1 and AnotherProp eq 2';
    const expected = '$filter=SomeProp eq 1 and AnotherProp eq 2'
    const actual = buildQueryString({ filter });
    expect(actual).toEqual(expected);
  });

  it('should allow passing filter as an array of objects and strings', () => {
    const filter = [{ SomeProp: 1 }, { AnotherProp: 2 }, 'startswith(Name, "foo")'];
    const expected = '$filter=SomeProp eq 1 and AnotherProp eq 2 and startswith(Name, "foo")'
    const actual = buildQueryString({ filter });
    expect(actual).toEqual(expected);
  });

  describe('data types', () => {
    it('should handle numbers', () => {
      const filter = { NumberProp: 1 };
      const expected = "$filter=NumberProp eq 1"
      const actual = buildQueryString({ filter });
      expect(actual).toEqual(expected);
    });

    it('should handle strings', () => {
      const filter = { StringProp: '2' };
      const expected = "$filter=StringProp eq '2'"
      const actual = buildQueryString({ filter });
      expect(actual).toEqual(expected);
    });

    it('should handle dates', () => {
      const filter = { DateProp: new Date(Date.UTC(2017, 2, 30, 7, 30)) };
      const expected = "$filter=DateProp eq 2017-03-30T07:30:00Z"
      const actual = buildQueryString({ filter });
      expect(actual).toEqual(expected);
    });
  });

  describe('functions', () => {
    it('should allow passing boolean functions as operators', () => {
      const filter = { Name: {'contains': 'foo'} }
      const expected = "$filter=contains(Name, 'foo')"
      const actual = buildQueryString({ filter });
      expect(actual).toEqual(expected);
    });
  });

  describe('logical operators', () => {
    it('should handle simple logical operators (and, or, etc)', () => {
      const filter = { and: [{ SomeProp: 1 }, { AnotherProp: 2 }] }
      const expected = "$filter=(SomeProp eq 1 and AnotherProp eq 2)"
      const actual = buildQueryString({ filter });
      expect(actual).toEqual(expected);
    });

    it('should handle nested logical operators', () => {
      const filter = { and: [{ SomeProp: 1 }, { or: [{ AnotherProp: 2 }, { ThirdProp: 3 }] }] }
      const expected = "$filter=(SomeProp eq 1 and (AnotherProp eq 2 or ThirdProp eq 3))"
      const actual = buildQueryString({ filter });
      expect(actual).toEqual(expected);
    });

    it('should handle logical operators with a single filter', () => {
      const filter = { and: [{ SomeProp: 1 }] }
      const expected = "$filter=(SomeProp eq 1)"
      const actual = buildQueryString({ filter });
      expect(actual).toEqual(expected);
    });

    it('should handle logical operators with no filters', () => {
      const filter = { and: [] }
      const expected = "$filter=()"
      const actual = buildQueryString({ filter });
      expect(actual).toEqual(expected);
    });
  })
})

describe('groupBy', () => {
  it('should allow passing since property as string', () => {
    const groupBy = 'SomeProp';
    const expected = '$apply=groupby((SomeProp),aggregate(Id with countdistinct as Total))';
    const actual = buildQueryString({ groupBy });
    expect(actual).toEqual(expected);
  });

  it('should allow passing multiple properites as an array', () => {
    const groupBy = ['FirstProp', 'SecondProp'];
    const expected = '$apply=groupby((FirstProp,SecondProp),aggregate(Id with countdistinct as Total))';
    const actual = buildQueryString({ groupBy });
    expect(actual).toEqual(expected);
  });

  it('should allow ordering', () => {
    const groupBy = 'SomeProp';
    const orderBy = 'SomeProp'
    const expected = '$apply=groupby((SomeProp),aggregate(Id with countdistinct as Total))&$orderby=SomeProp';
    const actual = buildQueryString({ groupBy, orderBy });
    expect(actual).toEqual(expected);
  });
})