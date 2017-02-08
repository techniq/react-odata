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